/*
 * @Author: ink-song 229135518@qq.com
 * @Date: 2024-01-19 11:46:59
 * @LastEditors: ink-song 229135518@qq.com
 * @LastEditTime: 2024-02-02 16:36:18
 * @FilePath: /manager-serve/app.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const log4js = require("./utils/log4");
const router = require("koa-router")();
const util = require("./utils/util");
const koaJwt = require("koa-jwt");
const users = require("./routes/users");
const menus = require("./routes/menus");
const roles = require("./routes/roles");
const depts = require("./routes/depts");
const leaves_ = require("./routes/leaves");

onerror(app);

require("./config/db");
router.prefix("/api");

app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(json());
app.use(require("koa-static")(__dirname + "/public"));
app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

app.use(async (ctx, next) => {
  log4js.info(`get params:${JSON.stringify(ctx.request.query)}`);
  log4js.info(`post params:${JSON.stringify(ctx.request.body)}`);
  await next().catch((err) => {
    if (err.status == "401") {
      ctx.status = 200;
      ctx.body = util.fail("Token认证失败", util.CODE.AUTH_ERROR);
    } else {
      throw err;
    }
  });
});

app.use(koaJwt({ secret: "ice" }).unless({ path: [/^\/api\/users\/login/] }));

router.use(users.routes(), users.allowedMethods());
router.use(menus.routes(), users.allowedMethods());
router.use(roles.routes(), roles.allowedMethods());
router.use(depts.routes(), depts.allowedMethods());
router.use(leaves_.routes(), leaves_.allowedMethods());
app.use(router.routes(), router.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  // console.error("server error", err, ctx);
  log4js.error(`${err.stack}`);
});

module.exports = app;
