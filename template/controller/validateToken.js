const moment = require("moment");

const config = require("../config").appConfig;

const authenticationModel = require("../models/authentication");

async function validateToken(req, res) {
  const { hash } = req.params;
  const selection = {
    account_reset_token: hash,
  };
  let validateTokenResponse = await authenticationModel
    .verifyUser(selection, req.headers.postgres)
    .catch(err => {
      const error = err;
      error.status = 500;
      return error;
    });
  if (validateTokenResponse === null) {
    validateTokenResponse = [];
  }
  if (validateTokenResponse.length === 0) {
    return res.status(404).json({
      message: "Invalid Token Provided",
    });
  }
  validateTokenResponse = validateTokenResponse.find(
    res => res.account_reset_token === hash
  );
  // eslint-disable-next-line camelcase
  const { account_reset_dt } = validateTokenResponse;
  if (
    moment().utcOffset("+05:30").unix()
      - moment(account_reset_dt).utcOffset("+05:30").unix()
    > config.tokenExpiry
  ) {
    return res.status(401).json({
      message: "Token Expired",
    });
  }
  return res.status(200).json({
    valid: true,
  });
}

module.exports = validateToken;
