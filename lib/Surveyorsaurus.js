"use strict";
var Config = require('./Config');
var TestCaseMapper = require("./mappers/TestCaseMapper.js");
var TestHistoryManager = require("./test/TestHistoryManager.js");
var TestRunner = require("./test/TestRunner.js");
var ImageComparison = require("./test/ImageComparison.js");
var AssertTest = require("./test/AssertTest.js");
var TestResults = require("./test/TestResults.js");
var ScreenshotDriver = require("./screenshot/ScreenshotDriver.js");

class Surveyorsaurus {
    
    constructor(config) {
        this.config = config;
    }

    load(configJson, callback) {
        Config.validate(configJson, (err, configData) => {
            if (err) return callback(err);
            this.scenarios = TestCaseMapper.mapScenarios(configData.scenarios);
            this.testHistory = new TestHistoryManager(this.config);
            this.testRunner = new TestRunner(this.testHistory, new ScreenshotDriver(), new AssertTest(this.testHistory, new ImageComparison(this.testHistory)));
            callback(null, this.scenarios);
        });
    }

    run(callback) {
        this.testRunner.runScenarios(this.scenarios, (err, scenarioResults) => {
            if (err) return callback(err, null);
            callback(null, new TestResults(scenarioResults));
        });
    }
}

module.exports = Surveyorsaurus;