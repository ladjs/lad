
export default class Users {

  static async retrieve(ctx) {
    ctx.body = ctx.req.user;
  }

}
