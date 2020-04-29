const moment = require("moment");
const jsonwebtoken = require("jsonwebtoken");
const CryptoJS = require("crypto-js");

const config = require("../config").appConfig;
const pjson = require("../package.json");

const authenticationModel = require("../models/authentication");

const decrypt = data => {
  const bytes = CryptoJS.AES.decrypt(data, config.encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

async function authenticateUser(req, res) {
  const { loginID, password, tenantID } = req.body;
  const selection = {
    account_hash: CryptoJS.SHA256(config.encryptionKey + loginID).toString(),
    password: CryptoJS.SHA256(
      config.encryptionKey + Buffer.from(password, "base64").toString("ascii")
    ).toString(),
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
      message: "Invalid Credentials",
    });
  }
  if (!authenticateUserResponse[0].authorised_tenants.includes(tenantID)) {
    return res.status(401).json({
      message: "User doesn't have access to the requested tenant",
    });
  }
  const token = jsonwebtoken.sign(
    {
      sub: decrypt(authenticateUserResponse[0].email),
      roles: [authenticateUserResponse[0].account_details.userType],
      aud: tenantID,
      iss: `${pjson.name}-v${pjson.version}-tenant-${tenantID}`,
      exp: moment().add(config.tokenExpiry, "second").unix(),
    },
    config.jwtKey,
    { algorithm: "HS256" }
  );
  return res.status(200).json({
    token,
  });
}

module.exports = authenticateUser;
