const moment = require("moment");
const jsonwebtoken = require("jsonwebtoken");
const CryptoJS = require("crypto-js");

const config = require("../config").appConfig;

const authenticationModel = require("../models/authentication");

const decrypt = data => {
    const bytes = CryptoJS.AES.decrypt(data, config.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

async function verifyToken(req, res, next) {
    try {
        const {
            token,
            tenantID
        } = req.body;
        const decodedToken = jsonwebtoken.verify(token.trim(), config.jwtKey);
        const selection = {
            account_hash: CryptoJS.SHA256(config.encryptionKey + decodedToken.sub).toString()
        };
        let verifyTokenResponse = await authenticationModel
            .verifyUser(selection, req.headers.postgres)
            .catch(err => {
                const error = err;
                error.status = 500;
                return error;
            });
        if (verifyTokenResponse === null) {
            verifyTokenResponse = [];
        }
        if (verifyTokenResponse.length === 0) {
            return res.status(404).json({
                message: "Invalid Token Provided"
            });
        }
        verifyTokenResponse = verifyTokenResponse[0];
        const {
            first_name,
            last_name,
            email,
            account_details,
            authorised_tenants,
            account_reset_dt
        } = verifyTokenResponse;
        if (moment().utcOffset("+05:30").unix() - moment(account_reset_dt).utcOffset("+05:30").unix() > config.tokenExpiry) {
            return res.status(401).json({
                message: "Token Expired"
            });
        }
        if (!verifyTokenResponse.authorised_tenants.includes(tenantID)) {
            return res.status(401).json({
                message: "User doesn't have access to the requested tenant"
            });
        }
        return res.status(200).json({
            firstName: decrypt(first_name),
            lastName: decrypt(last_name),
            email: decrypt(email),
            authorisedTenants: authorised_tenants,
            accountDetails: account_details,
            validToken: true
        });
    } catch (error) {
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

module.exports = verifyToken;
