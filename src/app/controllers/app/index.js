
export default class AppController {

  static async home(ctx) {
    await ctx.render('home');
  }

  static status(ctx) {
    ctx.body = { status: 'online' };
  }

}
