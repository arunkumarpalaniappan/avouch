const CryptoJS = require("crypto-js");
const moment = require("moment");
const { uniq } = require("lodash");
const config = require("../config").appConfig;

const authenticationModel = require("../models/authentication");

const encrypt = data =>
  CryptoJS.AES.encrypt(data, config.encryptionKey).toString();

async function createUser(req, res) {
  const {
    firstName,
    lastName,
    email,
    authorisedTenants,
    password,
    accountDetails,
    tenantID,
  } = req.body;
  const selection = {
    account_hash: CryptoJS.SHA256(config.encryptionKey + email).toString(),
  };
  const dataToInsert = {
    first_name: encrypt(firstName),
    last_name: encrypt(lastName),
    email: encrypt(email),
    password: CryptoJS.SHA256(
      config.encryptionKey + Buffer.from(password, "base64").toString("ascii")
    ).toString(),
    authorised_tenants: uniq([...authorisedTenants, tenantID]),
    account_details: accountDetails,
    account_created_dt: moment().utcOffset("+05:30").format(),
    account_hash: CryptoJS.SHA256(config.encryptionKey + email).toString(),
    account_pass: encrypt(Buffer.from(password, "base64").toString("ascii")),
  };
  const verifyExitingUser = await authenticationModel
    .verifyUser(selection, req.headers.postgres)
    .catch(err => {
      const error = err;
      error.status = 500;
      return error;
    });
  if (
    (verifyExitingUser && verifyExitingUser.length === 0)
    || verifyExitingUser === null
    || !verifyExitingUser
  ) {
    let createUserResponse = await authenticationModel
      .createUser(dataToInsert, req.headers.postgres)
      .catch(err => {
        const error = err;
        error.status = 500;
        return error;
      });
    if (createUserResponse === null) {
      createUserResponse = [];
    }
    if (createUserResponse.type === 200) {
      return res.status(200).json();
    }
    return res.status(422).json(createUserResponse);
  }
  return res.status(422).json({
    message: "User with same email address already exist",
  });
}

module.exports = createUser;
