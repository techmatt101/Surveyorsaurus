"use strict";
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
    scenarios: Joi.object().pattern(/\w+/, scenarioSchema).required()
});

class Config {
    static validate(configData, callback) {
        Joi.validate(configData, configSchema, (err, value) => {
            if (err) {
                err.message = "Invalid config. \n  Reason: " + err.message;
                callback(err);
            }
            callback(err, value);
        });
    }
}

module.exports = Config;