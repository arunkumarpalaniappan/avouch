const Sequelize = require("sequelize");

const findAll = (selectionCriteria, projection, db, collection) =>
  new Promise((resolve, reject) => {
    db[collection]
      .findAll({
        offset: projection.offset ? projection.offset : 0,
        limit: projection.limit ? projection.limit : 10,
        where: selectionCriteria,
      })
      .then(res => resolve(res.map(rs => rs.dataValues)))
      .catch(err => reject(err));
  });
const findOne = (selectionCriteria, db, collection) =>
  new Promise((resolve, reject) => {
    db[collection]
      .findAll({
        where: selectionCriteria,
      })
      .then(res => resolve(res.map(rs => rs.dataValues)))
      .catch(err => reject(err));
  });
const updateRecord = (selection, dataToUpdate, db, collection) =>
  new Promise((resolve, reject) => {
    db[collection]
      .update(dataToUpdate, { where: selection })
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
const insertMany = (dataToInsert, db, collection) =>
  new Promise((resolve, reject) => {
    db[collection]
      .bulkCreate(dataToInsert)
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
const insertOne = (dataToInsert, db, collection) =>
  new Promise((resolve, reject) => {
    db[collection]
      .create(dataToInsert)
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
const findbyQuery = (query, sequelize) =>
  new Promise((resolve, reject) => {
    sequelize
      .query(query, { type: Sequelize.QueryTypes.SELECT })
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
module.exports = {
  findAll,
  findOne,
  updateRecord,
  findbyQuery,
  insertMany,
  insertOne,
};
