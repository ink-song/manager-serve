/*
 * @Author: ink-song 229135518@qq.com
 * @Date: 2024-01-15 12:29:27
 * @LastEditors: ink-song 229135518@qq.com
 * @LastEditTime: 2024-01-18 10:32:17
 * @FilePath: /manager-serve/utils/log4.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: ink-song 229135518@qq.com
 * @Date: 2024-01-15 12:29:27
 * @LastEditors: ink-song 229135518@qq.com
 * @LastEditTime: 2024-01-15 12:53:44
 * @FilePath: /manager-serve/utils/log4.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 日志存储
 * @author JackBean
 */
const log4js = require("log4js");

const levels = {
  trace: log4js.levels.TRACE,
  debug: log4js.levels.DEBUG,
  info: log4js.levels.INFO,
  warn: log4js.levels.WARN,
  error: log4js.levels.ERROR,
  fatal: log4js.levels.FATAL,
};

log4js.configure({
  appenders: {
    console: { type: "console" },
    info: {
      type: "file",
      filename: "logs/all-logs.log",
    },
    error: {
      type: "dateFile",
      filename: "logs/log",
      pattern: "yyyy-MM-dd.log",
      alwaysIncludePattern: true, // 设置文件名称为 filename + pattern
    },
  },
  categories: {
    default: { appenders: ["console"], level: "debug" },
    info: {
      appenders: ["info", "console"],
      level: "info",
    },
    error: {
      appenders: ["error", "console"],
      level: "error",
    },
  },
});

/**
 * 日志输出，level为debug
 * @param {string} content
 */
exports.debug = (content) => {
  let logger = log4js.getLogger();
  logger.level = levels.debug;
  logger.debug(content);
};

/**
 * 日志输出，level为info
 * @param {string} content
 */
exports.info = (content) => {
  let logger = log4js.getLogger("info");
  logger.level = levels.info;
  logger.info(content);
};

/**
 * 日志输出，level为error
 * @param {string} content
 */
exports.error = (content) => {
  let logger = log4js.getLogger("error");
  logger.level = levels.error;
  logger.error(content);
};
