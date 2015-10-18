var fs = require('fs');
var Joi = require('joi');

var testsSchema = Joi.object().keys({
    description: Joi.string(),
    element: Joi.string().required(),
    mismatchPercentageLeeway: Joi.number().default(0.01)
});

var scenarioSchema = Joi.object().keys({
    description: Joi.string(),
    url: Joi.string().uri().required(),
    tests: Joi.object().pattern(/\w+/, testsSchema).min(1).required()
});

var configSchema = Joi.object().keys({
    scenarios: Joi.object().pattern(/\w+/, scenarioSchema).required(),
    viewports: Joi.array()
});

function loadConfig(path, callback) {
    fs.readFile(path, 'utf8', function(err, configData) {
        if (err) throwValidationError(err);
        try {
            configData = JSON.parse(configData);
        } catch (err) {
            throwValidationError(err);
        }
        Joi.validate(configData, configSchema, function(err, value) {
            if (err) throwValidationError(err);
            callback(value);
        });
    });
}

function throwValidationError(err) {
    err.message = "Failed to load config file! \n  Reason: " + err.message;
    throw err;
}

module.exports = {
    load: loadConfig
};