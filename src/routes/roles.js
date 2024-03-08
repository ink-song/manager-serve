const router = require("koa-router")();
const util = require("../utils/util");
const Roles = require("../models/rolesSchema");
router.prefix("/roles");

// 获取所有角色列表
router.get("/allList", async (ctx, next) => {
  try {
    const res = await Roles.find({}, "_id roleName");
    ctx.body = util.success(res, "操作成功");
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});

// 获取有分页的角色列表
router.get("/list", async (ctx, next) => {
  const { roleName } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query);
  const params = {};
  if (roleName) params.roleName = roleName;
  try {
    const roles = Roles.find(params);
    const rolesList = await roles.skip(skipIndex).limit(page.pageSize);
    const total = await Roles.countDocuments(params);
    ctx.body = util.success({
      list: rolesList,
      page: {
        ...page,
        total,
      },
    });
  } catch (error) {
    ctx.body = util.fail(`查询失败：${error.stack}`);
  }
});

// 角色的新增/编辑/删除
router.post("/operate", async (ctx, next) => {
  const { _id, roleName, remark, action } = ctx.request.body;
  const params = {
    roleName,
    remark,
  };
  let info, res;
  try {
    if (action === "add") {
      res = await Roles.create(params);
      info = "创建角色成功";
    } else if (action === "edit") {
      res = await Roles.findOneAndUpdate({ _id }, params);
      info = "角色更新成功";
    } else if (action === "delete") {
      res = await Roles.findOneAndDelete({ _id });
      info = "角色删除成功";
    }
    ctx.body = util.success("", info);
  } catch (error) {
    ctx.body = util.fail(`操作失败：${error.stack}`);
  }
});

// 编辑权限
router.post("/update/permission", async (ctx, next) => {
  const { permissionList, _id } = ctx.request.body;
  try {
    const params = {
      permissionList,
      update: new Date(),
    };
    const role = await Roles.findByIdAndUpdate(_id, params);
    ctx.body = util.success(role, "编辑成功");
  } catch (error) {
    ctx.body = util.fail(`操作失败：${error.stack}`);
  }
});

module.exports = router;
