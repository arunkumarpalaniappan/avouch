const moment = require("moment");
const jsonwebtoken = require("jsonwebtoken");
const CryptoJS = require("crypto-js");

const config = require("../config").appConfig;

const authenticationModel = require("../models/authentication");

const decrypt = data => {
    const bytes = CryptoJS.AES.decrypt(data, config.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

const encrypt = (data) => CryptoJS.AES.encrypt(data, config.encryptionKey).toString();

async function resetPassword(req, res, next) {
    const {
        token,
        password,
        tenantID,
    } = req.body;
    const selection = {
        account_reset_token: token
    };
    let resetPasswordResponse = await authenticationModel
        .verifyUser(selection, req.headers.postgres)
        .catch(err => {
            const error = err;
            error.status = 500;
            return error;
        });
    if (resetPasswordResponse === null) {
        resetPasswordResponse = [];
    }
    if (resetPasswordResponse.length === 0) {
        return res.status(404).json({
            message: "Invalid Token Provided"
        });
    }
    resetPasswordResponse = resetPasswordResponse.find(res => res.account_reset_token === token);
    const {
        account_reset_dt
    } = resetPasswordResponse;
    if (moment().utcOffset("+05:30").unix() - moment(account_reset_dt).utcOffset("+05:30").unix() > 3600) {
        return res.status(401).json({
            message: "Token Expired"
        });
    }
    if (!resetPasswordResponse.authorised_tenants.includes(tenantID)) {
        return res.status(401).json({
            message: "User doesn't have access to the requested tenant"
        });
    }
    await authenticationModel
        .updateUser(selection, {
            password: CryptoJS.SHA256(config.encryptionKey+Buffer.from(password, 'base64').toString('ascii')).toString(),
            account_pass: encrypt(Buffer.from(password, 'base64').toString('ascii'))
        }, req.headers.postgres)
        .catch(err => {
            const error = err;
            error.status = 500;
            return error;
        });
    return res.status(200).json({
        message: "Password updated successfully!"
    });
}

module.exports = resetPassword;
