/**
 * Created by xiaobxia on 2017/7/4.
 */
const co = require('co');
const md5 = require('md5');
const moment = require('moment');
const BaseService = require('./base');
const UserORM = require('../model/orm/sys/user');
const UserRoleORM = require('../model/orm/sys/userRole');
const clone = require('../../util/object').clone;

module.exports = class UserService extends BaseService {
  getUserById(userId) {
    let self = this;
    let fn = co.wrap(function*(id) {
      let connection = self.getConnection();
      let userORM = new UserORM(connection);
      let result = yield userORM.getUserByUserId(id);
      return userORM.dataToHump(result)[0];
    });
    return fn(userId);
  }

  getUsersCount() {
    let self = this;
    let fn = co.wrap(function*() {
      let connection = self.getConnection();
      let userORM = new UserORM(connection);
      let result = yield userORM.getUsersCount();
      return result[0].count;
    });
    return fn();
  }

  getUsers(start, offset) {
    let self = this;
    let fn = co.wrap(function*(start, offset) {
      let connection = self.getConnection();
      let userORM = new UserORM(connection);
      let result = yield userORM.getUsers(start, offset);
      return userORM.dataToHump(result);
    });
    return fn(start, offset);
  }

  changePwd(user, oldPassword, newPassword) {
    let encryptPwd = md5(user['USER_CODE'] + '#' + oldPassword);
    //验证密码
    if (encryptPwd !== user['PWD']) {
      this.throwBaseError('用户原密码错误', 'USER_ORIGIN_PWD_ERROR');
    }
    //密码不能相同
    if (oldPassword === newPassword) {
      this.throwBaseError('密码相同', 'USER_CHANGE_PWD_ORIGIN_AND_NEW_ARE_SAME_ERROR');
    }
    //密码长度
    if (newPassword.length < 5 || newPassword.length > 20) {
      this.throwBaseError('密码长度不合规', 'USER_PWD_LENGTH_ERROR');
    }
    let self = this;
    let fn = co.wrap(function*(user, oldPassword, newPassword) {
      let connection = self.getConnection();
      let userORM = new UserORM(connection);
      yield userORM.updateUserByUserId(user['USER_ID'], {
        PWD: md5(`${user['USER_CODE']}#${newPassword}`)
      });
      self.loggerWarn(`${user['USER_CODE']}修改了密码 ** 新密码: ${newPassword}`);
    });
    return fn(user, oldPassword, newPassword);
  }

  getUsersByRoleId(roleId) {
    let self = this;
    let fn = co.wrap(function*(roleId) {
      let dbResult = null;
      let connection = self.getConnection();
      let userORM = new UserORM(connection);
      let userRoleORM = new UserRoleORM(connection);
      dbResult = yield userRoleORM.getUserIdsByRoleId(roleId);
      if (dbResult.length > 0) {
        let ids = [];
        for (let k = 0, len = dbResult.length; k < len; k++) {
          ids.push(dbResult[k]['USER_ID']);
        }
        dbResult = yield userORM.getUsersByIds(ids);
        return userORM.dataToHump(dbResult);
      } else {
        return [];
      }
    });
    return fn(roleId);
  }

  addUser(userInfo) {
    let self = this;
    let fn = co.wrap(function*(userInfo) {
      let userCode = userInfo.userCode;
      let dbResult = null;
      let connection = self.getConnection();
      let userORM = new UserORM(connection);
      dbResult = yield userORM.checkUserCodeExist(userCode);
      if (dbResult.length > 0) {
        self.throwBaseError('USER_CODE已存在', 'USER_CODE_HAS_EXIST');
      } else {
        let data = userORM.dataToHyphen(userInfo);
        data['PWD'] = md5(userCode + '#' + userCode);
        data['STATE'] = 'A';
        let now = moment();
        let nowString = moment().format('YYYY-M-D HH:mm:ss');
        data['STATE_DATE'] = nowString;
        if (!data['USER_EFF_DATE']) {
          data['USER_EFF_DATE'] = nowString;
        }
        if (data['USER_EXP_DATE']) {
          if (moment(data['USER_EXP_DATE']).isBefore(now)) {
            self.throwBaseError('时间设置错误', 'USER_BEGIN_END_DATE_ERROR');
          }
        }
        data['LOGIN_FAIL'] = 0;
        delete data['USER_ID'];
        yield userORM.addUser(data);
      }
    });
    return fn(userInfo);
  }

  updateUser(userInfo) {
    let self = this;
    let fn = co.wrap(function*(userInfo) {
      let connection = self.getConnection();
      let userORM = new UserORM(connection);
      let userId = userInfo.userId;
      userInfo = clone({
        target: userInfo,
        filterKey: ['userId', 'userCode', 'pwd', 'createdDate'],
        deleteEmpty: true
      });
      let data = userORM.dataToHyphen(userInfo);
      yield userORM.updateUserByUserId(userId, data);
    });
    return fn(userInfo);
  }

  lockUser(userId, adminId) {
    let self = this;
    let fn = co.wrap(function*(userId, adminId) {
      if (userId === adminId) {
        self.throwBaseError('不能锁定自己', 'USER_LOCK_SELF_ERROR');
      }
      let connection = self.getConnection();
      let userORM = new UserORM(connection);
      yield userORM.lockUserById(userId);
    });
    return fn(userId, adminId);
  }
};
