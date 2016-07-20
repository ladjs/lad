
import { EmailTemplate } from 'email-templates';
import s from 'underscore.string';
import _ from 'lodash';
import nodemailer from 'nodemailer';
import { htmlToText } from 'nodemailer-html-to-text';
import { Logger } from '../helpers';
import config from '../config';
import path from 'path';

export default class Jobs {

  getJobs() {
    return [
      [ 'email', {}, this.email ]
    ];
  }

  async email(job, done) {

    if (!_.isString(job.attrs.data.template)
      || s.isBlank(job.attrs.data.template))
      return done(new Error('email `template` missing'));

    if (!_.isString(job.attrs.data.to) || s.isBlank(job.attrs.data.to))
      return done(new Error('email `to` missing'));

    job.attrs.data = _.defaults(job.attrs.data, {
      ...config.email
    });

    try {

      // create transport and add html to text conversion
      const transport = nodemailer.createTransport(config.postmark);
      transport.use('compile', htmlToText());

      const template = new EmailTemplate(
        path.join(__dirname, '..', 'emails', job.attrs.data.template)
      );

      if (!_.isObject(job.attrs.data.locals))
        job.attrs.data.locals = {};

      const results = await template.render({
        ... job.attrs.data.locals // avoid max call stack
      });

      const transportOptions = {
        ...results,
        from: job.attrs.data.from,
        to: job.attrs.data.to,
        attachments: job.attrs.data.attachments,
        headers: job.attrs.data.headers
      };

      const res = await transport.sendMail(transportOptions);

      Logger.info('email sent', { extra: res });

      done();

    } catch (err) {
      done(err);
    }

  }

}
