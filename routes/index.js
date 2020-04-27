const express = require("express");
const { celebrate, Joi } = require("celebrate");

const prometheusRouter = express.Router();

const loginController = require("../controller/loginController");
const signupController = require("../controller/signupController");
const forgotController = require("../controller/forgotController");
const validateTenant = require("../utils/validateTenant");

prometheusRouter.post("/login", [
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

prometheusRouter.post("/register", [
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

prometheusRouter.post("/forgot", [
    validateTenant.authorise,
    celebrate({
        body: Joi.object().keys({
            loginID: Joi.string().required(),
            tenantID: Joi.string().required()
        })
    }),
    forgotController
]);

prometheusRouter.post("/reset", [
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


module.exports = prometheusRouter;
