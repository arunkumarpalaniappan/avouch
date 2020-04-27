const config = require("../config").appConfig;

exports.authorise = function(req, res, next) {
  const { tenantID } = req.body;
  if(config.validTenants[tenantID]) {
    next();
  } else {
      return res.status(401).json({
        message: "Invalid tenant ID provided!"
      });
  }
};
