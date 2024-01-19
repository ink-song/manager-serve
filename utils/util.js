/*
 * @Author: ink-song 229135518@qq.com
 * @Date: 2024-01-18 10:27:53
 * @LastEditors: ink-song 229135518@qq.com
 * @LastEditTime: 2024-01-18 10:55:51
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

const log4js = require("log4js");

const CODE = {
  SUCCESS: 200,
  PARA_ERROR: 10001,
  USER_ACCOUNT_ERROR: 20001, // 用户名或密码错误
  USER_LOGIN_ERROR: 30001, // 用户未登录
  BUSINESS_ERROR: 40001, // 业务请求失败
  AUTH_ERROR: 50001, // 认证失败或者TOKEN过期ss
};

moudle.exports = {
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
    log4js.debug(data);
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
};
