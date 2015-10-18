var Joi = require('joi');
var mapper = require('./mapper');

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
    scenarios: Joi.object().pattern(/\w+/, scenarioSchema).required()
});

function validateConfig(configData, callback) {
    Joi.validate(configData, configSchema, function(err, value) {
        if (err) {
            err.message = "Invalid config. \n  Reason: " + err.message;
            callback(err);
        }
        value.scenarios = mapper.mapScenarios(value.scenarios);
        callback(err, value);
    });
}

module.exports = {
    validate: validateConfig
};