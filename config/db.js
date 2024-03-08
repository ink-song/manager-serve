/*
 * @Author: ink-song 229135518@qq.com
 * @Date: 2024-01-19 12:52:01
 * @LastEditors: ink-song 229135518@qq.com
 * @LastEditTime: 2024-01-19 12:55:56
 * @FilePath: /manager-serve/config/db.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 数据库连接
 */
const mongoose = require("mongoose");
const congfig = require("./index");
const logger = require("../src/utils/log4.js");

mongoose.connect(congfig.URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", () => {
  logger.error("数据库连接失败");
});

db.once("open", () => {
  logger.info("数据库连接成功");
});

module.exports = db;
