const Router = require('koa-router');

const { policies } = require('../../../helpers');
const { api } = require('../../../app/controllers');

const router = new Router({
  prefix: '/v1'
});

/*
 * @api [post] /v1/account
 * description: "Creates an account for a user"
 * responses:
 *   "200":
 *     description: "A user object."
 *     schema:
 *       type: "String"
 */
router.post('/account', api.v1.users.create);

/*
 * @api [get] /v1/account
 * description: "Returns account details for current user"
 * responses:
 *   "200":
 *     description: "A user object."
 *     schema:
 *       type: "String"
 */
router.get('/account', policies.ensureApiToken, api.v1.users.retrieve);

/*
 * @api [put] /v1/account
 * description: "Replaces account details for current user"
 * responses:
 *   "200":
 *     description: "A user object."
 *     schema:
 *       type: "String"
 */
router.put('/account', policies.ensureApiToken, api.v1.users.update);

module.exports = router;
