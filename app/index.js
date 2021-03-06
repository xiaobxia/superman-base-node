/**
 * Created by xiaobxia on 2017/6/23.
 */
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('./common/logger');
const sysRouter = require('./routes/sys');
const checkLoginMidd = require('./middlewares/checkLogin');
const errorMidd = require('./middlewares/error');
const requestLogMidd = require('./middlewares/requestLog');
const config = require('../config/index');
const isDebug = config.server.debug;
let app = module.exports = express();

//得到服务器配置
const projectName = config.project.projectName;
const port = config.server.port || 4000;
if (!projectName) {
  logger.error('projectName is required');
  process.exit();
}

//请求中间件
app.use(require('method-override')());

//post数据中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//cookie和session的中间件
app.use(cookieParser(config.server.session_secret));
app.use(session({
  secret: config.server.session_secret,
  name: projectName,   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
  cookie: {
    maxAge: 1000 * 60 * 20,
    httpOnly: true
  },
  rolling: true,
  //强制session保存到session store中
  resave: false,
  //强制没有“初始化”的session保存到storage中，没有初始化的session指的是：刚被创建没有被修改,如果是要实现登陆的session那么最好设置为false
  saveUninitialized: false
}));

if (!isDebug) {
  app.use(requestLogMidd);
  app.use(checkLoginMidd);
}
app.get('/', function (req, res, next) {
  res.send('hello world');
});
//路由
app.use(`/${projectName}`, sysRouter);

//错误中间件
app.use(errorMidd);

//404错误
app.use(function (req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

//启动服务器
module.exports = app.listen(port, function (err) {
  if (err) {
    logger.debug(err);
    return;
  }
  let uri = 'http://localhost:' + port;
  logger.fatal('Listening at ' + uri);
});
