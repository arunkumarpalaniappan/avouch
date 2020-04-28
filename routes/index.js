const express = require("express");
const { celebrate, Joi } = require("celebrate");

const avouchRouter = express.Router();

const loginController = require("../controller/loginController");
const signupController = require("../controller/signupController");
const updateUserController = require("../controller/updateUser");
const forgotController = require("../controller/forgotController");
const validateTokenController = require("../controller/validateToken");
const resetPasswordController = require("../controller/resetPassword");
const verifyTokenController = require("../controller/verifyToken");
const refreshTokenController = require("../controller/refreshToken");
const validateTenant = require("../utils/validateTenant");

avouchRouter.post("/login", [
    validateTenant.authorise,
    celebrate({
        body: Joi.object().keys({
            loginID: Joi.string().required(),
            password: Joi.string().required(),
            tenantID: Joi.string().required()
        })
    }),
    loginController
]);

avouchRouter.post("/register", [
    validateTenant.authorise,
    celebrate({
        body: Joi.object().keys({
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            email: Joi.string().required(),
            password: Joi.string().required(),
            authorisedTenants: Joi.array().required(),
            accountDetails: {
                phone: Joi.string().optional(),
                designation: Joi.string().optional(),
                token: Joi.string().optional(),
                roleID: Joi.string().required(),
                salesArea: Joi.string().optional(),
                territory: Joi.string().optional(),
                state: Joi.string().optional(),
                region: Joi.string().optional(), 
                userType: Joi.string().optional(), 
                dealerRO: Joi.array().optional(), 
                expoToken: Joi.string().optional(), 
             },
             tenantID: Joi.string().required()
        })
    }),
    signupController
]);

avouchRouter.put("/register", [
    validateTenant.authorise,
    celebrate({
        body: Joi.object().keys({
            firstName: Joi.string().optional(),
            lastName: Joi.string().optional(),
            email: Joi.string().required(),
            password: Joi.string().optional(),
            authorisedTenants: Joi.array().optional(),
            accountDetails: {
                phone: Joi.string().optional(),
                designation: Joi.string().optional(),
                token: Joi.string().optional(),
                roleID: Joi.string().optional(),
                salesArea: Joi.string().optional(),
                territory: Joi.string().optional(),
                state: Joi.string().optional(),
                region: Joi.string().optional(), 
                userType: Joi.string().optional(), 
                dealerRO: Joi.array().optional(), 
                expoToken: Joi.string().optional(), 
             },
             tenantID: Joi.string().optional()
        })
    }),
    updateUserController
]);

avouchRouter.post("/forgot", [
    validateTenant.authorise,
    celebrate({
        body: Joi.object().keys({
            loginID: Joi.string().required(),
            tenantID: Joi.string().required()
        })
    }),
    forgotController
]);

avouchRouter.get("/verify/:hash", [
    celebrate({
        params: {
            hash: Joi.string().required()
          }
    }),
    validateTokenController
]);

avouchRouter.post("/reset", [
    validateTenant.authorise,
    celebrate({
        body: Joi.object().keys({
            password: Joi.string().required(),
            tenantID: Joi.string().required(),
            token: Joi.string().required()
        })
    }),
    resetPasswordController
]);

avouchRouter.post("/authenticate", [
    validateTenant.authorise,
    celebrate({
        body: Joi.object().keys({
            tenantID: Joi.string().required(),
            token: Joi.string().required()
        })
    }),
    verifyTokenController
]);

avouchRouter.post("/refresh", [
    validateTenant.authorise,
    celebrate({
        body: Joi.object().keys({
            tenantID: Joi.string().required(),
            token: Joi.string().required()
        })
    }),
    refreshTokenController
]);

module.exports = avouchRouter;
