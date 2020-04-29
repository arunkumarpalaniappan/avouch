const moment = require("moment");
const CryptoJS = require("crypto-js");

const config = require("../config").appConfig;

const authenticationModel = require("../models/authentication");
const sendResetEmail = require("../utils/sendResetEmail");

async function authenticateUser(req, res) {
  const { loginID, tenantID } = req.body;
  const selection = {
    account_hash: CryptoJS.SHA256(config.encryptionKey + loginID).toString(),
  };
  let authenticateUserResponse = await authenticationModel
    .verifyUser(selection, req.headers.postgres)
    .catch(err => {
      const error = err;
      error.status = 500;
      return error;
    });
  if (authenticateUserResponse === null) {
    authenticateUserResponse = [];
  }
  if (authenticateUserResponse.length === 0) {
    return res.status(404).json({
      message: "User not found!",
    });
  }
  if (!authenticateUserResponse[0].authorised_tenants.includes(tenantID)) {
    return res.status(401).json({
      message: "User doesn't have access to the requested tenant",
    });
  }
  const resetToken = {
    account_reset_token: CryptoJS.SHA256(
      config.encryptionKey + loginID + moment().utcOffset("+05:30").format()
    ).toString(),
    account_reset_dt: moment().utcOffset("+05:30").format(),
  };
  await authenticationModel
    .updateUser(selection, resetToken, req.headers.postgres)
    .catch(err => {
      const error = err;
      error.status = 500;
      return error;
    });
  sendResetEmail.sendEmail({
    ...resetToken,
    loginID,
    emailConfig: config.validTenants[tenantID].email,
  });
  return res.status(200).json({
    message: "Email with reset password link is sent!",
  });
}

module.exports = authenticateUser;
