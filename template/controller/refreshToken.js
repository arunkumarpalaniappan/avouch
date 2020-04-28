const moment = require("moment");
const jsonwebtoken = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const pjson = require("../package.json");

const config = require("../config").appConfig;

const authenticationModel = require("../models/authentication");

const decrypt = data => {
    const bytes = CryptoJS.AES.decrypt(data, config.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

async function refreshToken(req, res, next) {
    try {
        const {
            token,
            tenantID
        } = req.body;
        const decodedToken = jsonwebtoken.verify(token.trim(), config.jwtKey);
        const selection = {
            account_hash: CryptoJS.SHA256(config.encryptionKey + decodedToken.sub).toString()
        };
        let refreshTokenResponse = await authenticationModel
            .verifyUser(selection, req.headers.postgres)
            .catch(err => {
                const error = err;
                error.status = 500;
                return error;
            });
        if (refreshTokenResponse === null) {
            refreshTokenResponse = [];
        }
        if (refreshTokenResponse.length === 0) {
            return res.status(404).json({
                message: "Invalid Token Provided"
            });
        }
        refreshTokenResponse = refreshTokenResponse[0];
        const {
            first_name,
            last_name,
            email,
            account_details,
            authorised_tenants,
            account_reset_dt
        } = refreshTokenResponse;
        if (moment().utcOffset("+05:30").unix() - moment(account_reset_dt).utcOffset("+05:30").unix() > config.tokenExpiry) {
            return res.status(401).json({
                message: "Token Expired1"
            });
        }
        if (!refreshTokenResponse.authorised_tenants.includes(tenantID)) {
            return res.status(401).json({
                message: "User doesn't have access to the requested tenant"
            });
        }
        const refreshedToken = jsonwebtoken.sign(
            {
              sub: decrypt(email),
              roles: [account_details.userType],
              aud: tenantID,
              iss: `${pjson.name}-v${pjson.version}-tenant-${tenantID}`,
              exp: moment()
                .add(config.tokenExpiry, "second")
                .unix()
            },
            config.jwtKey,
            { algorithm: "HS256" }
          );
          return res.status(200).json({
            token: refreshedToken
        });
    } catch (error) {
        console.log(error)
        if (error.message.trim() === "invalid signature") {
            return res.status(401).json({
                message: "Invalid Token"
            });
        }
        return res.status(401).json({
            message: "Token Expired"
        });
    }
}

module.exports = refreshToken;
