const router = require("koa-router")();
const Leaves = require("../models/leavesSchema");
const Dept = require("../models/deptSchema");
const utils = require("../utils/util");
router.prefix("/leave");
const monment = require("moment");

// 列表
router.get("/list", async (ctx) => {
  const { pageSize, pageNum, applyState, type } = ctx.request.query;
  const { skipIndex, page } = utils.pager({ pageSize, pageNum });
  const authorization = ctx.request.headers.authorization;
  const { data } = utils.decode(authorization);
  try {
    let params = {};
    if (type == "approve") {
      if (applyState == 1 || applyState == 2) {
        params.curAuditUserName = data.userName;
        params.$or = [{ applyState: 1 }, { applyState: 2 }];
      } else if (applyState > 2) {
        params = { "auditFlows.userId": data.userId, applyState };
      } else {
        params = { "auditFlows.userId": data.userId };
      }
    } else {
      params = {
        "applyUser.userId": data.userId,
      };
      if (applyState) params.applyState = applyState;
    }
    const allList = Leaves.find(params);
    const list = await allList.skip(skipIndex).limit(page.pageSize);
    const total = await Leaves.countDocuments(params);
    ctx.body = utils.success(
      {
        page: {
          ...page,
          total,
        },
        list,
      },
      "查询成功"
    );
  } catch (error) {
    ctx.body = utils.fail(error.stack);
  }
});
// 新建/作废
router.post("/operate", async (ctx) => {
  const { action, _id, ...params } = ctx.request.body;
  let otherParams = {
    applyUser: {
      userId: "",
      userName: "",
    },
    orderNo: "",
    auditUsers: "",
    curAuditUserName: "",
    auditFlows: [],
    auditLogs: [],
  };
  // 获取用户信息
  const { data } = utils.decode(ctx.request.headers.authorization);
  // 当前申请人信息
  otherParams.applyUser.userId = data.userId;
  otherParams.applyUser.userName = data.userName;
  const total = await Leaves.countDocuments();
  // 唯一编码
  otherParams.orderNo = `XJ${monment(new Date()).format("YYYYMMDD")}${total}`;
  // 确定当前审批流程
  // 球员提交审批-教练批准-管理层批准- 老板批准
  // 找到这三个部门的所有人
  const deptList = await Dept.find({
    deptName: { $in: ["文化宣传", "酒球递"] },
  });

  // 找到当前自己部门的负责人
  const dept = await Dept.findById(data.deptId[data.deptId.length - 1]);
  otherParams.auditFlows = [
    {
      _id: dept._id,
      userId: dept.userId,
      userName: dept.userName,
      userEmail: dept.userEmail,
    },
  ];
  deptList.forEach((i) => {
    otherParams.auditFlows.push({
      _id: i._id,
      userId: i.userId,
      userName: i.userName,
      userEmail: i.userEmail,
    });
  });
  otherParams.auditFlows.forEach((i) => {
    otherParams.auditUsers += `${i.userName}/`;
  });

  otherParams.curAuditUserName = dept.userName;

  if (action === "add") {
    try {
      await Leaves.create({ ...params, ...otherParams });
    } catch (error) {}
  } else {
    try {
      await Leaves.findByIdAndUpdate(_id, { applyState: 5 });
    } catch (error) {}
  }
  ctx.body = utils.success({}, "操作成功");
});

// 审批/驳回
router.post("/approve", async (ctx) => {
  const { action, _id, remark } = ctx.request.body;
  let params = {};

  try {
    const authorization = ctx.request.headers.authorization;
    const { data } = utils.decode(authorization);
    // 获取日志, 改变审批状态 添加审批日志
    // 1:待审批 2:审批中 3:审批拒绝 4:审批通过 5:作废
    const doc = await Leaves.findById(_id);
    params.auditLogs = doc.auditLogs;

    if (action === "refuse") {
      params.applyState = 3;
      // 驳回
    } else {
      // 通过
      // 通过当前审批的日志的条数和审批人的auditFlows
      if (doc.auditFlows.length === doc.auditLogs.length) {
        ctx.body = util.success("当前申请单已处理，请勿重复提交");
        return;
      } else if (doc.auditFlows.length === doc.auditLogs.length + 1) {
        // 最后一级
        params.applyState = 4;
      } else if (doc.auditFlows.length > doc.auditLogs.length) {
        // 说明还在审批
        params.applyState = 2;
        params.curAuditUserName =
          doc.auditFlows[doc.auditLogs.length + 1].userName;
      }
    }
    params.auditLogs.push({
      userId: data.userId,
      userName: data.userName,
      createTime: new Date(),
      remark,
      action: action == "refuse" ? "审核拒绝" : "审核通过",
    });
    await Leaves.findByIdAndUpdate(_id, params);
    ctx.body = utils.success("操作成功");
  } catch (error) {
    ctx.fail(error.stack);
  }
});

// 审批计数
router.get("/count", async (ctx) => {
  let authorization = ctx.request.headers.authorization;
  let { data } = utils.decode(authorization);
  try {
    let params = {};
    params.curAuditUserName = data.userName;
    params.$or = [{ applyState: 1 }, { applyState: 2 }];
    const total = await Leaves.countDocuments(params);
    ctx.body = utils.success(total);
  } catch (error) {
    ctx.body = utils.fail(`查询异常：${error.message}`);
  }
});
module.exports = router;
