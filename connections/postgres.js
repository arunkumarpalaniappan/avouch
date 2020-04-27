const fs = require("fs");

const path = require("path");

const Sequelize = require("sequelize");

const basename = path.basename(__filename);

const appRoot = require("app-root-path");

const env = process.env.NODE_ENV || "development";

const dbConfig = require(`${appRoot}/config/postgres.json`)[env];
const dbOptions = dbConfig.options;
const db = {};
let sequelize = null;
dbOptions.reconnect = {
  max_retries: 999,
  onRetry: function(count) {
    // eslint-disable-next-line no-console
    console.log(`connection lost, trying to reconnect (${count})`);
  }
};
dbOptions.retry = {
  match: [
    /SequelizeConnectionError/,
    /SequelizeConnectionRefusedError/,
    /SequelizeHostNotFoundError/,
    /SequelizeHostNotReachableError/,
    /SequelizeInvalidConnectionError/,
    /SequelizeConnectionTimedOutError/
  ],
  name: "query",
  backoffBase: 100,
  backoffExponent: 1.1,
  timeout: 60000,
  max: Infinity
};

function connectToDb() {
  sequelize = new Sequelize(
    `postgres://${dbConfig.userName}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}?ssl=${dbConfig.ssl}`,
    dbOptions
  );
  return new Promise((resolve, reject) => {
    sequelize
      .authenticate()
      .then(() => {
        attachModels();
        db.sequelize = sequelize;
        db.Sequelize = Sequelize;
        resolve(db);
      })
      .catch(err => {
        reject(err);
      });
  });
}
// sequelize-auto -h "neohospostgres.postgres.database.azure.com" -d "bpcl" -u "neohosuser@neohospostgres" -x "CWK7M4n&7t" -p 5432  -e "postgres" -o "./schema"
function attachModels() {
  const schemaPath = `${__dirname}/schema`;
  // eslint-disable-next-line no-sync
  fs.readdirSync(schemaPath)
    .filter(
      file =>
        file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    )
    .forEach(file => {
      const model = sequelize.import(path.join(schemaPath, file));
      db[model.name] = model;
    });

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
}

module.exports = Object.assign({}, { connectToDb });
