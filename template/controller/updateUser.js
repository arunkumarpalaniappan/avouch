/* eslint-disable camelcase */
/* eslint-disable complexity */
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
  const dataToUpdate = {};
  if (firstName && firstName.length) {
    dataToUpdate.first_name = encrypt(firstName);
  }
  if (lastName && lastName.length) {
    dataToUpdate.last_name = encrypt(lastName);
  }
  if (password && password.length) {
    dataToUpdate.password = CryptoJS.SHA256(
      config.encryptionKey + Buffer.from(password, "base64").toString("ascii")
    ).toString();
    dataToUpdate.account_pass = encrypt(
      Buffer.from(password, "base64").toString("ascii")
    );
  }
  if (authorisedTenants && authorisedTenants.length) {
    dataToUpdate.authorised_tenants = uniq([...authorisedTenants, tenantID]);
  }
  if (accountDetails) {
    dataToUpdate.account_details = accountDetails;
  }
  const verifyExitingUser = await authenticationModel
    .verifyUser(selection, req.headers.postgres)
    .catch(err => {
      const error = err;
      error.status = 500;
      return error;
    });
  if (verifyExitingUser && verifyExitingUser.length > 0) {
    dataToUpdate.account_updated_dt = moment().utcOffset("+05:30").format();
    const { account_details } = verifyExitingUser[0];
    Object.keys(account_details).forEach(key => {
      if (!dataToUpdate.account_details[key]) {
        dataToUpdate.account_details[key] = account_details[key];
      }
    });
    let updateUserResponse = await authenticationModel
      .updateUser(selection, dataToUpdate, req.headers.postgres)
      .catch(err => {
        const error = err;
        error.status = 500;
        return error;
      });
    if (updateUserResponse === null) {
      updateUserResponse = [];
    }
    if (updateUserResponse.type === 200) {
      return res.status(200).json();
    }
    return res.status(422).json(updateUserResponse);
  }
  return res.status(422).json({
    message: "User with same email address not found!",
  });
}

module.exports = createUser;
