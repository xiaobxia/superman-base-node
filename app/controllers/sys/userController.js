/**
 * Created by xiaobxia on 2017/7/4.
 */
const co = require('co');
const BaseController = require('../base');
const UserService = require('../../service/userService');
const PrivilegeService = require('../../service/privilegeService')
module.exports = class UserController extends BaseController {
  /**
   * method get
   * api sys/user/:id
   * @param req
   * @param res
   * @param next
   * benchmark 500/700
   */
  getUser() {
    let self = this;
    return co.wrap(function*(req, res, next) {
      let requestData = {
        id: parseInt(req.params.id)
      };
      let illegalMsg = self.validate(
        {id: {required: 'true', type: 'number'}},
        requestData
      );
      let result = self.result();
      if (illegalMsg === undefined) {
        let connection = null;
        try {
          connection = yield self.getPoolConnection();
          let userService = new UserService(connection);
          let user = yield userService.getUserById(requestData.id);
          connection.release();
          result.setResult(user);
          res.json(result);
        } catch (error) {
          if (connection) {
            connection.release();
          }
          next(error);
        }
      } else {
        let msg = illegalMsg[0];
        next(self.parameterError(msg.field + ' ' + msg.message, msg.code));
      }
    });
  }

  /**
   * method get
   * api sys/user/usersCount
   * @param req
   * @param res
   * @param next
   * benchmark 500/650
   */
  getUsersCount() {
    let self = this;
    return co.wrap(function*(req, res, next) {
      let connection = null;
      let result = self.result();
      try {
        connection = yield self.getPoolConnection();
        let userService = new UserService(connection);
        let count = yield userService.getUsersCount();
        connection.release();
        result.setResult(count);
        res.json(result);
      } catch (error) {
        if (connection) {
          connection.release();
        }
        next(error);
      }
    });
  }

  /**
   * method get
   * api /sys/users
   * @param req
   * @param res
   * @param next
   * benchmark 500/820
   */
  getUsers() {
    let self = this;
    return co.wrap(function*(req, res, next) {
      let query = req.query;
      let pagingModel = self.paging(query.pageIndex, query.pageSize);
      let result = self.result();
      let connection = null;
      try {
        connection = yield self.getPoolConnection();
        let userService = new UserService(connection);
        let users = yield userService.getUsers(pagingModel.start, pagingModel.offset);
        connection.release();
        result.setResult(users);
        res.json(result);
      } catch (error) {
        if (connection) {
          connection.release();
        }
        next(error);
      }
    });
  }

  /**
   * method post
   * api sys/user/checkUserMenuPriv
   * @param req
   * @param res
   * @param next
   */
  checkUserMenuPriv() {
    let self = this;
    return co.wrap(function*(req, res, next) {
      let rules = {
        path: {type: 'string', required: true}
      };
      let illegalMsg = self.validate(rules, req.body);
      if (illegalMsg === undefined) {
        let connection = null;
        let result = self.result();
        let user = self.getSessionUser(req.session);
        try {
          connection = yield self.getPoolConnection();
          let privilegeService = new PrivilegeService(connection);
          let ifPass = yield privilegeService.checkUserMenuPriv(user['USER_ID'], req.body.path);
          connection.release();
          result.setResult(ifPass);
          res.json(result);
        } catch (error) {
          if (connection) {
            connection.release();
          }
          next(error);
        }
      } else {
        let msg = illegalMsg[0];
        next(self.parameterError(msg.field + ' ' + msg.message, msg.code));
      }
    });
  }

  /**
   * method post
   * api sys/user/changePwd
   * @param req
   * @param res
   * @param next
   */
  changePwd() {
    let self = this;
    return co.wrap(function*(req, res, next) {
      let postData = req.body;
      let rules = {
        oldPwd: {type: 'string', required: true},
        newPwd: {type: 'string', required: true}
      };
      let illegalMsg = self.validate(rules, postData);
      if (illegalMsg === undefined) {
        let connection = null;
        let result = self.result();
        let user = self.getSessionUser(req.session);
        try {
          connection = yield self.getPoolConnection();
          let userService = new UserService(connection);
          yield userService.changePwd(user, postData.oldPwd, postData.newPwd);
          connection.release();
          res.json(result);
        } catch (error) {
          if (connection) {
            connection.release();
          }
          next(error);
        }
      } else {
        let msg = illegalMsg[0];
        next(self.parameterError(msg.field + ' ' + msg.message, msg.code));
      }
    });
  }

  /**
   * method get
   * api sys/user/userrole/:id
   * @param req
   * @param res
   * @param next
   */
  getUsersByRoleId() {
    let self = this;
    return co.wrap(function*(req, res, next) {
      let requestData = {
        id: parseInt(req.params.id)
      };
      let illegalMsg = self.validate(
        {id: {required: 'true', type: 'number'}},
        requestData
      );
      let result = self.result();
      if (illegalMsg === undefined) {
        let connection = null;
        try {
          connection = yield self.getPoolConnection();
          let userService = new UserService(connection);
          let user = yield userService.getUsersByRoleId(requestData.id);
          connection.release();
          result.setResult(user);
          res.json(result);
        } catch (error) {
          if (connection) {
            connection.release();
          }
          next(error);
        }
      } else {
        let msg = illegalMsg[0];
        next(self.parameterError(msg.field + ' ' + msg.message, msg.code));
      }
    });
  }

  /**
   * method post
   * api sys/user/add
   * @param req
   * @param res
   * @param next
   */
  addUser() {
    let self = this;
    return co.wrap(function*(req, res, next) {
      let requestData = {
        userCode: req.body.userCode
      };
      let illegalMsg = self.validate(
        {userCode: {required: true, type: 'string', min: 4}},
        requestData
      );
      let result = self.result();
      if (illegalMsg === undefined) {
        let connection = null;
        try {
          connection = yield self.getPoolConnection();
          let userService = new UserService(connection);
          yield userService.addUser(req.body);
          connection.release();
          res.json(result);
        } catch (error) {
          if (connection) {
            connection.release();
          }
          next(error);
        }
      } else {
        let msg = illegalMsg[0];
        next(self.parameterError(msg.field + ' ' + msg.message, msg.code));
      }
    });
  }

  /**
   * method post
   * api sys/user/update
   * @param req
   * @param res
   * @param next
   */
  updateUser() {
    let self = this;
    return co.wrap(function*(req, res, next) {
      let connection = null;
      let result = self.result();
      try {
        connection = yield self.getPoolConnection();
        let userService = new UserService(connection);
        yield userService.updateUser(req.body);
        connection.release();
        res.json(result);
      } catch (error) {
        if (connection) {
          connection.release();
        }
        next(error);
      }
    });
  }

  /**
   * method get
   * api sys/user/lock/:id
   * @param req
   * @param res
   * @param next
   */
  lockUser() {
    let self = this;
    return co.wrap(function*(req, res, next) {
      let requestData = {
        id: parseInt(req.params.id)
      };
      let illegalMsg = self.validate(
        {id: {required: 'true', type: 'number'}},
        requestData
      );
      let result = self.result();
      if (illegalMsg === undefined) {
        let connection = null;
        try {
          connection = yield self.getPoolConnection();
          let userService = new UserService(connection);
          let adminUser = self.getSessionUser(req.session);
          yield userService.lockUser(requestData.id, adminUser['USER_ID']);
          connection.release();
          res.json(result);
        } catch (error) {
          if (connection) {
            connection.release();
          }
          next(error);
        }
      } else {
        let msg = illegalMsg[0];
        next(self.parameterError(msg.field + ' ' + msg.message, msg.code));
      }
    });
  }

  /**
   * method get
   * api sys/user/unlock/:id
   * @param req
   * @param res
   * @param next
   */
  unlockUser() {
    let self = this;
    return co.wrap(function*(req, res, next) {
      let requestData = {
        id: parseInt(req.params.id)
      };
      let illegalMsg = self.validate(
        {id: {required: 'true', type: 'number'}},
        requestData
      );
      let result = self.result();
      if (illegalMsg === undefined) {
        let connection = null;
        try {
          connection = yield self.getPoolConnection();
          let userService = new UserService(connection);
          yield userService.unlockUser(requestData.id);
          connection.release();
          res.json(result);
        } catch (error) {
          if (connection) {
            connection.release();
          }
          next(error);
        }
      } else {
        let msg = illegalMsg[0];
        next(self.parameterError(msg.field + ' ' + msg.message, msg.code));
      }
    });
  }

  /**
   * method get
   * api sys/user/resetPwd/:id
   * @param req
   * @param res
   * @param next
   */
  resetPwd() {
    let self = this;
    return co.wrap(function*(req, res, next) {
      let requestData = {
        id: parseInt(req.params.id)
      };
      let illegalMsg = self.validate(
        {id: {required: 'true', type: 'number'}},
        requestData
      );
      let result = self.result();
      if (illegalMsg === undefined) {
        let connection = null;
        try {
          connection = yield self.getPoolConnection();
          let userService = new UserService(connection);
          yield userService.resetPwd(requestData.id);
          connection.release();
          res.json(result);
        } catch (error) {
          if (connection) {
            connection.release();
          }
          next(error);
        }
      } else {
        let msg = illegalMsg[0];
        next(self.parameterError(msg.field + ' ' + msg.message, msg.code));
      }
    });
  }
};