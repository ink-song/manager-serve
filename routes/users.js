/*
 * @Author: ink-song 229135518@qq.com
 * @Date: 2024-01-19 11:46:59
 * @LastEditors: ink-song 229135518@qq.com
 * @LastEditTime: 2024-01-23 23:46:18
 * @FilePath: /manager-serve/routes/users.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const router = require("koa-router")();
const User = require("../models/userSchema");
const util = require("../utils/util");
const jwt = require("jsonwebtoken");
/**
 * 用户管理模块
 */
router.prefix("/users");

router.get("/getPermissionList", async (ctx, next) => {
  ctx.body = "quanxian";
});

// 用户的登录接口
router.post("/login", async (ctx, next) => {
  const { userName, userPwd } = ctx.request.body;
  try {
    const res = await User.findOne({ userName, userPwd });
    if (res) {
      const data = res._doc;
      const token = jwt.sign(
        {
          data,
        },
        "ice",
        { expiresIn: "12h" }
      );
      data.token = token;
      ctx.body = util.success(data);
    } else {
      ctx.body = util.fail("用户名或密码错误");
    }
  } catch (error) {
    ctx.body = util.fail("error", error.msg);
  }
});

// 用户列表查询;
router.get("/list", async (ctx, next) => {
  // 拿到request的请求参数
  const { userName, userId, state } = ctx.request.query;
  // 拿到分页的参数和从哪一页开始查询
  const { page, skipIndex } = util.pager(ctx.request.query);
  // 创建params
  let params = {};
  if (userName) params.userName = userName;
  if (userId) params.userId = userId;
  if (state && state !== "0") params.state = state;
  // 从用户model中查询所有的列表数据
  try {
    const query = User.find(params, { _id: 0, userPwd: 0 });
    // 再通过分页的参数进行筛选查询
    const list = await query.skip(skipIndex).limit(page.pageSize);
    // 计算total值
    const total = await User.countDocuments(params);
    ctx.body = util.success({
      list,
      page: {
        ...page,
        total,
      },
    });
  } catch (error) {
    ctx.body = util.fail("查询异常", error.stack);
  }
});

// 用户删除/ 批量删除
router.post("/delete", async (ctx) => {
  // 待删除的用户Id数组
  const { userIds } = ctx.request.body;
  const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 });
  if (res.modifiedCount) {
    ctx.body = util.success(res, `共删除成功${res.modifiedCount}条`);
    return;
  }
  ctx.body = util.fail("删除失败");
});

module.exports = router;
