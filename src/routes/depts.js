const router = require("koa-router")();
const util = require("../utils/util");
const Depts = require("../models/deptSchema");

router.prefix("/dept");

// 部门的新增/编辑/删除
router.post("/operate", async (ctx, next) => {
  const { action, _id, ...params } = ctx.request.body;
  let info;
  try {
    if (action === "add") {
      await Depts.create(params);
      info = "创建部门成功";
    } else if (action === "edit") {
      await Depts.findOneAndUpdate({ _id }, params);
      info = "编辑部门成功";
    } else if (action === "delete") {
      await Depts.findByIdAndDelete(_id);
      await Menus.deleteMany({ parentId: { $all: [_id] } });
      info = "删除部门成功";
    }
  } catch (error) {
    ctx.body = util.fail(`操作失败:${error.stack}`);
  }

  ctx.body = util.success("", info);
});

// 部门列表
router.get("/list", async (ctx, next) => {
  const { deptName } = ctx.request.query;
  const params = {};
  if (deptName) params.deptName = deptName;
  try {
    const list = await Depts.find(params);
    if (list) {
      ctx.body = util.success(treeMenu(list), "查询成功");
    }
  } catch (error) {}
});

// 递归遍历列表
const treeMenu = (list, grandParentId = null) => {
  return list
    .filter((item) =>
      String(item.parentId[item.parentId.length - 1]) === String(grandParentId)
        ? item._doc
        : null
    )
    .map((sitem) => ({
      ...sitem._doc,
      children: treeMenu(list, sitem._id),
    }));
};

module.exports = router;
