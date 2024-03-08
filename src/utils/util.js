/*
 * @Author: ink-song 229135518@qq.com
 * @Date: 2024-01-18 10:27:53
 * @LastEditors: ink-song 229135518@qq.com
 * @LastEditTime: 2024-01-29 15:47:36
 * @FilePath: /manager-serve/utils/util.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 *
 * @param {String} url
 * @param {Object} params
 * @param {Object} header
 *
 */

const log4js = require("./log4");
const jwt = require("jsonwebtoken");

const CODE = {
  SUCCESS: 200,
  PARA_ERROR: 10001,
  USER_ACCOUNT_ERROR: 20001, // 用户名或密码错误
  USER_LOGIN_ERROR: 30001, // 用户未登录
  BUSINESS_ERROR: 40001, // 业务请求失败
  AUTH_ERROR: 50001, // 认证失败或者TOKEN过期ss
};

module.exports = {
  pager({ pageNum = 1, pageSize = 10 }) {
    pageNum *= 1;
    pageSize *= 1;
    const skipIndex = (pageNum - 1) * pageSize;
    return {
      page: {
        pageNum,
        pageSize,
      },
      skipIndex,
    };
  },
  success(data = "", msg = "", code = CODE.SUCCESS) {
    // log4js.debug(data);
    return {
      code,
      data,
      msg,
    };
  },
  fail(msg = "", code = CODE.BUSINESS_ERROR, data = "") {
    log4js.error(msg);
    return {
      code,
      data,
      msg,
    };
  },
  CODE,
  decode(authorization) {
    if (authorization) {
      return jwt.verify(authorization.split(" ")[1], "ice");
    }
    return "";
  },
  // 递归查询树结构
  /**
   * 要解决的问题是: 要将偏平的数据结构转换成树形结构. 以children作为装载的容器,判断依据是数据里面的当前id和parentId是否
   */
  treeMenu(arr, parentId = null) {
    return arr
      .filter((item) =>
        String(parentId) === String(item.parentId[item.parentId.length - 1])
          ? item._doc
          : null
      )
      .map((sitem) => ({
        ...sitem._doc,
        children: this.treeMenu(arr, sitem._id),
      }));
  },
  // 通过递归遍历tree,找到对应的key
  findKeys(tree, key) {
    let arr = [];
    for (const item of tree) {
      if (item[key]) {
        arr.push(item.menuCode);
      }
      if (item.children && item.children.length) {
        arr = arr.concat(this.findKeys(item.children, key));
      }
    }
    return arr;
  },
};
