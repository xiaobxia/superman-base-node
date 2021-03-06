/**
 * Created by xiaobxia on 2017/7/24.
 */
const co = require('co');
const BaseService = require('./../base');
const FileORM = require('../../model/orm/sys/fileORM');
const clone = require('../../../util/object').clone;

module.exports = class FileService extends BaseService {
  getFiles(start, offset) {
    let self = this;
    let fn = co.wrap(function*(start, offset) {
      let connection = self.getConnection();
      let fileORM = new FileORM(connection);
      let result = yield fileORM.getFiles(start, offset);
      let files = fileORM.dataToHump(result);
      files.sort(function (a, b) {
        return b.id - a.id;
      });
      return files;
    });
    return fn(start, offset);
  }

  getFilesCount() {
    let self = this;
    let fn = co.wrap(function*() {
      let connection = self.getConnection();
      let fileORM = new FileORM(connection);
      let result = yield fileORM.getFilesCount();
      return result[0].count;
    });
    return fn();
  }

  addFile(fileInfo) {
    let self = this;
    let fn = co.wrap(function*(fileInfo) {
      let connection = self.getConnection();
      let fileORM = new FileORM(connection);
      fileInfo = clone(fileInfo, function (key, target) {
        let keys = ['bucket', 'bucketName', 'isPublic'];
        return (keys.indexOf(key) === -1);
      });
      let data = fileORM.dataToHyphen(fileInfo);
      data['STATE'] = 1;
      let dbResult = yield fileORM.addFile(data);
      return dbResult.insertId;
    });
    return fn(fileInfo);
  }

  updateFile(fileInfo) {
    let self = this;
    let fn = co.wrap(function*(fileInfo) {
      let connection = self.getConnection();
      let fileORM = new FileORM(connection);
      let id = fileInfo['id'];
      fileInfo = clone(fileInfo, function (key, target) {
        //url不能修改
        let keys = ['id', 'fileUrl'];
        return (keys.indexOf(key) === -1);
      });
      let data = fileORM.dataToHyphen(fileInfo);
      yield fileORM.updateFileById(id, data);
    });
    return fn(fileInfo);
  }

  getFileById(id) {
    let self = this;
    let fn = co.wrap(function*(id) {
      let connection = self.getConnection();
      let fileORM = new FileORM(connection);
      let result = yield fileORM.getFileById(id);
      self.checkDBResult(result, '不存在的文件', 'FILE_NOT_EXIST');
      return fileORM.dataToHump(result)[0];
    });
    return fn(id);
  }

  getPictures(start, offset) {
    let self = this;
    let fn = co.wrap(function*(start, offset) {
      let connection = self.getConnection();
      let fileORM = new FileORM(connection);
      let pictures = yield fileORM.getPictures(start, offset);
      return fileORM.dataToHump(pictures);
    });
    return fn(start, offset);
  }

  getPicturesCount() {
    let self = this;
    let fn = co.wrap(function*() {
      let connection = self.getConnection();
      let fileORM = new FileORM(connection);
      let result = yield fileORM.getPicturesCount();
      return result[0].count;
    });
    return fn();
  }

  getPicturesBySearchFileName(fileName, start, offset) {
    let self = this;
    let fn = co.wrap(function*(start, offset) {
      let connection = self.getConnection();
      let fileORM = new FileORM(connection);
      let pictures = yield fileORM.getPicturesBySearchFileName(fileName, start, offset);
      return fileORM.dataToHump(pictures);
    });
    return fn(start, offset);
  }

  getPicturesCountBySearchFileName(fileName) {
    let self = this;
    let fn = co.wrap(function*(fileName) {
      let connection = self.getConnection();
      let fileORM = new FileORM(connection);
      let result = yield fileORM.getPicturesCountBySearchFileName(fileName);
      return result[0].count;
    });
    return fn(fileName);
  }

  deleteFileById(id) {
    let self = this;
    let fn = co.wrap(function*(id) {
      let connection = self.getConnection();
      let fileORM = new FileORM(connection);
      let result = yield fileORM.deleteFileById(id);
      if (result.affectedRows === 0) {
        self.throwBaseError('不可删除', 'FILE_NOT_EXIST');
      }
    });
    return fn(id);
  }
};
