/**
 * Created by xiaobxia on 2017/6/23.
 */
const co = require('co');
const BaseController = require('../base');
const LoginService = require('../../service/loginService');
const SessionService = require('../../service/sessionService');
const LoginModel = require('../../model/result/loginModel');
module.exports = class LoginController extends BaseController {
  /**
   * method post
   * api sys/login
   * @param req
   * @param res
   * @param next
   * benchmark 100/(3300-4800)
   */
  login() {
    let self = this;
    return co.wrap(function*(req, res, next) {
      let postBody = req.body;
      let session = req.session;
      let data = {
        userCode: postBody.userCode,
        pwd: postBody.pwd
      };
      let rules = {
        userCode: {type: 'string', required: true},
        pwd: {type: 'string', required: true}
      };
      let illegalMsg = self.validate(rules, data);
      let result = self.result();
      if (illegalMsg === undefined) {
        let connection = null;
        try {
          connection = yield self.getPoolConnection();
          let loginService = new LoginService(connection);
          let user = yield loginService.login(postBody.userCode, postBody.pwd);
          let sessionService = new SessionService(connection);
          yield sessionService.saveSession({
            userId: user['USER_ID'],
            userState: user['STATE'],
            ua: req.headers['user-agent'],
            token: session.id
          });
          connection.release();
          let loginModel = new LoginModel();
          self.setSessionUser(req.session, user);
          loginModel.setLogin(true);
          loginModel.setUserCode(user['USER_CODE']);
          loginModel.setUserName(user['USER_NAME']);
          loginModel.setToken(session.id);
          result.setResult(loginModel);
          res.json(result);
        } catch (error) {
          //TODO 给error分类
          if (connection) {
            connection.release();
          }
          result.setErrorCode(error.code);
          result.setErrorMessage(error.message);
          res.json(result);
        }
      } else {
        let msg = illegalMsg[0];
        next(self.error(msg.field + ' ' + msg.message, msg.code));
      }
    });
  }
};
// const BaseResult = require('../../model/result/baseResult');
// const LoginModel = require('../../model/result/loginModel');
// const loginService = require('../../service/loginService');
// const sessionConst = require('../../model/const/session');
// const sessionService = require('../../service/sessionService');
//

// exports.login = function (req, res, next) {
//   let postBody = req.body;
//   let session = req.session;
//   //let session = new Session();
//   loginService(postBody, session.id, req.headers['user-agent'], function (error, user) {
//     let result = new BaseResult();
//     if (error) {
//       result.setErrorCode(error.code);
//       result.setErrorMessage(error.message);
//     } else {
//       let loginModel = new LoginModel();
//       req.session[sessionConst.SESSION_LOGIN_USER] = user;
//       loginModel.setLogin(true);
//       loginModel.setUserCode(user['USER_CODE']);
//       loginModel.setUserName(user['USER_NAME']);
//       loginModel.setToken(session.id);
//       result.setResult(loginModel)
//     }
//     res.json(result)
//   })
// };
// /**
//  * method get
//  * api sys/isLogin
//  * @param req
//  * @param res
//  * @param next
//  */
// exports.isLogin = function (req, res, next) {
//   let session = req.session;
//   let result = new BaseResult();
//   let loginModel = new LoginModel();
//   let user = session[sessionConst.SESSION_LOGIN_USER];
//   if (user) {
//     loginModel.setLogin(true);
//     loginModel.setUserCode(user['USER_CODE']);
//     loginModel.setUserName(user['USER_NAME']);
//     loginModel.setToken(session.id)
//   } else {
//     loginModel.setLogin(false);
//   }
//   result.setResult(loginModel);
//   res.json(result);
// };
// /**
//  * method get
//  * api sys/logout
//  * @param req
//  * @param res
//  * @param next
//  */
// exports.logout = function (req, res, next) {
//   let result = new BaseResult();
//   req.session.destroy();
//   //res.clearCookie(config.auth_cookie_name, { path: '/' });
//   //res.redirect('/');
//   //req.session[sessionConst.SESSION_LOGIN_USER] = null;
//   res.json(result)
// };
