
import uuid from 'uuid';
import opn from 'opn';
import ms from 'ms';
import sharp from 'sharp';
import zlib from 'zlib';
import AWS from 'aws-sdk';
import Stripe from 'stripe';
import device from 'device';
import mime from 'mime';
import Boom from 'boom';
import _ from 'lodash';
import s from 'underscore.string';
import moment from 'moment';

import { logger } from '../../../helpers';
import config from '../../../config';
import { Users, Gigs } from '../../models';

const stripe = new Stripe(config.stripe.secretKey);

export async function list(ctx, next) {

  // if the user is a bot then allow them access
  // otherwise if the user is not a bot then they
  // need to have a valid license and be logged in
  //
  // this allows search engines to scrape content
  // and it enforces users to have a license
  //
  // of course, someone could easily get past this
  // but if they want to make that effort so be it
  const userDevice = device(ctx.get('user-agent'));
  if (!userDevice.is('bot')
    && (!ctx.isAuthenticated() || !ctx.req.user.has_license)) {
    ctx.session.returnTo = ctx.req.url;
    ctx.flash('warning', ctx.translate('LICENSE_REQUIRED'));
    ctx.redirect(`/${ctx.req.locale}`);
    return;
  }

  let $match = {
    status: 'Approved',
    start_at: {
      $lte: new Date()
    },
    end_at: {
      $gte: new Date()
    }
  };

  let $sort = {};

  // if user is searching for something then add to the query
  // <http://stackoverflow.com/a/25509618>
  if (_.isString(ctx.query.search) && !s.isBlank(ctx.query.search)) {

    $match = {
      ...$match,
      $text: {
        $search: ctx.query.search
      }
    };

    // sort by relevance if we do not have a search filter yet
    if (_.isEmpty($sort))
      $sort = {
        score: {
          $meta: 'textScore'
        }
      };

  }

  // default sorting is by created_at
  if (_.isEmpty($sort))
    $sort = { created_at: -1 };

  // get paginated result of gigs
  // <https://github.com/Automattic/mongoose/issues/3683>
  let [ gigs, itemCount ] = await Promise.all([
    (async () => {
      const gigs = await Gigs.find($match)
        .sort($sort)
        .limit(ctx.query.limit)
        .skip(ctx.paginate.skip)
        .lean()
        .exec();
      return Promise.map(_.map(gigs, pos => {
        return Users.findById(pos.user).lean().exec();
      }));
    })(),
    Gigs.count($match).exec()
  ]);

  // omit user props we don't want to expose
  if (gigs.length > 0)
    gigs = _.map(gigs, gig => {
      gig.user = _.omit(gig.user, config.omitUserFields);
      return gig;
    });

  ctx.state.gigs = gigs;
  ctx.state.itemCount = itemCount;
  ctx.state.pageCount = Math.ceil(itemCount / ctx.query.limit);

  await next();

}

export async function create(ctx, next) {

  // filter body
  const body = _.pick(ctx.req.body, [
    'company_name',
    'company_email',
    'company_website',
    'gig_title',
    'gig_description',
    'stripe_token',
    'start_at'
  ]);

  // ensure stripe token exists
  if (!_.isString(body.stripe_token) || s.isBlank(body.stripe_token))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_STRIPE_TOKEN')));

  // ensure that date format is correct
  if (!_.isString(body.start_at)
    || s.isBlank(body.start_at)
    || !moment(body.start_at, 'MM/DD/YY').isValid()
    || moment(body.start_at, 'MM/DD/YY').isBefore(moment().startOf('day')))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_START_AT_DATE')));

  // validate fields
  const gig = new Gigs({
    ... _.omit(body, [ 'stripe_token', 'start_at' ]),
    ip: ctx.req.ip
  });

  try {
    gig.locale = ctx.req.locale;
    await gig.validate();
  } catch (err) {
    return ctx.throw(Boom.badRequest(err));
  }

  const file = ctx.req.file;

  // validate we have a file upload
  if (!_.isObject(file))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_FILE')));

  // lookup the mime type
  // <https://github.com/expressjs/multer/issues/403>
  file.mimetype = mime.lookup(file.originalName);

  if (!_.includes([
    'image/png',
    'image/jpeg',
    'image/gif'
  ], file.mimetype))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_COMPANY_LOGO')));

  // check if we already created a gig in the past day
  // with this given ip address, otherwise create and email
  const count = await Gigs.count({
    ip: ctx.req.ip,
    created_at: {
      $gte: moment().subtract(1, 'day').toDate()
    }
  });

  if (count > 0)
    return ctx.throw(Boom.badRequest(ctx.translate('GIG_POST_LIMIT')));

  try {

    // cancel timeout since this might take longer than normal
    clearTimeout(ctx.req._timeout);

    // generate random filename
    const fileName = uuid.v4();

    // create promise array
    const promises = _.map([
      // @1x
      [ 300, 300, '' ],
      // @2x
      [ 600, 600, '@2x' ]
    ], async (size) => {

      // prepare transformation
      const transform = sharp()
        .png()
        .clone()
        .resize(size[0], size[1])
        .crop()
        .flatten()
        .background('#fff');

      // apply transformation and gzip file
      const Body = file.stream
        .pipe(transform)
        .pipe(zlib.createGzip());

      // prepare AWS upload using config
      const s3 = new AWS.S3(config.aws);

      // set filename
      const Key = `uploads/${fileName}${size[2]}.png`;

      const obj = {
        Key,
        ACL: 'public-read',
        Body,
        CacheControl: `public, max-age=${ms('1yr')}`,
        ContentEncoding: 'gzip',
        ContentType: file.mimetype
      };

      return s3.upload(obj).promise();

    });

    const data = await Promise.all(promises);

    console.log('data', data);

    // get cloudfront path for first image only (@1x version)
    body.company_logo = `https://${config.aws.domainName}/${data[0].key}`;

    // if we're in dev mode then open the images in our browser
    if (config.env === 'development')
      _.each(data, img => opn(img.Location, { wait: false }));

    // charge user on stripe
    const charge = await stripe.charges.create({
      amount: parseInt(config.gigPostCostDollars * 100, 10),
      currency: 'usd',
      source: body.stripe_token
    });

    logger.info('Created charge', charge);

    gig.stripe_charge_id = charge.id;
    await gig.save();

    logger.info('Created gig', gig);

    // TODO: send out an email for approval to admin
    // TODO: send out an email to user with receipt + pending

    ctx.throw('foobar');

  } catch (err) {
    ctx.throw(err);
  }

  /*
  try {

    const inquiry = await Inquiries.create({
      ... ctx.req.body,
      ip: ctx.req.ip
    });

    logger.info('Created inquiry', inquiry);

    const job = await Jobs.create({
      name: 'email',
      data: {
        template: 'inquiry',
        to: ctx.req.body.email,
        cc: config.email.from,
        locals: {
          inquiry
        }
      }
    });

    logger.info('Queued inquiry email', job);

    inquiry.job = job._id;
    await inquiry.save();

    if (ctx.is('json')) {
      ctx.body = {
        message: ctx.translate('CONTACT_REQUEST_SENT'),
        reloadPage: true
      };
    } else {
      ctx.flash('success', ctx.translate('CONTACT_REQUEST_SENT'));
      ctx.redirect('back');
    }

  } catch (err) {

    logger.error(err, {
      ip: ctx.req.ip,
      message: ctx.req.body.message,
      email: ctx.req.body.email
    });

    ctx.throw(ctx.translate('CONTACT_REQUEST_ERROR'));

  }
  */

}

export async function retrieve(slug, ctx, next) {
  await next();
}

export async function update(ctx, next) {

}

export async function remove(ctx, next) {

}

export async function apply(ctx, next) {

}
