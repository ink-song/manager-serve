const router = require("koa-router")();
const util = require("../utils/util");
const Menus = require("../models/menusSchema");
router.prefix("/menu");

router.post("/operate", async (ctx, next) => {
  // 获取body 的数据
  const { _id, action, ...params } = ctx.request.body;
  // 判断是新增还是编辑还是删除
  let res, info;
  if (action === "add") {
    try {
      res = await Menus.create(params);
      info = "菜单创建成功";
    } catch (error) {
      ctx.body = util.fail(error.stack);
    }
  } else if (action === "edit") {
    // 通过id找到以后更新数据
    params.updateTime = new Date();
    res = await Menus.findOneAndUpdate({ _id }, params);
    info = "菜单更新成功";
  } else if (action === "delete") {
    // 首先删除自己
    res = await Menus.findByIdAndDelete(_id);
    // 再删除和自己相关子节点的数据
    await Menus.deleteMany({ parentId: { $all: [_id] } });
    info = "删除成功";
  }
  ctx.body = util.success("", info);
});

// 菜单查询
router.get("/list", async (ctx, next) => {
  // 获取到请求参数
  const { menuName, menuState } = ctx.request.query;
  const params = {};
  if (menuName) params.menuName = menuName;
  if (menuState) params.menuState = menuState;
  // 根据参数查询数据
  try {
    const menus = await Menus.find(params);
    ctx.body = util.success(
      {
        menuList: util.treeMenu(menus),
        actionList: util.findKeys(util.treeMenu(menus), "menuCode"),
      },
      "查询成功"
    );
  } catch (error) {
    ctx.body = util.fail(error.stack, "查询失败");
  }
});

module.exports = router;
