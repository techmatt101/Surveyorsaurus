"use strict";
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var ScreenshotMapper = require("../mappers/ScreenshotMapper.js");

class TestRunner extends EventEmitter {
    constructor(testHistoryManager, screenshotDriver, assertTest) {
        super();
        this._testHistoryManager = testHistoryManager;
        this._screenshotDriver = screenshotDriver;
        this._assertTest = assertTest;
    }

    runScenarios(scenarios, callback) {
        var start = Date.now();
        this.emit('start', { scenarios: scenarios });

        this._testHistoryManager.setUpFolders(() => {
            async.series(
                scenarios.map((scenario) =>
                    (callback) => this.runScenario(scenario, callback)
                ),
                (err) => {
                    var end = Date.now();
                    this.emit('end', {
                        scenarios: scenarios,
                        timeElapsed: end - start
                    });
                    callback(err, scenarios);
                }
            );
        });
    }

    runScenario(scenario, callback) {
        this.emit('scenarioStart', { scenario: scenario });
        var start = Date.now();
        var screenshotInstruction = ScreenshotMapper.mapScenarioToInstruction(scenario, this._testHistoryManager.config.currentDirPath);

        this._screenshotDriver.performInstruction(screenshotInstruction, (err) => {
            if (err) {
                err.message = "BROWSER ERROR: " + err.message;
                callback(err);
                return;
            }

            async.series(scenario.tests.map((test) =>
                (callback) => {
                    this.emit('testStart', { test: test });
                    this._assertTest.test(test, (err, test, passed, results) => {
                        this.emit('testEnd', { test: test, passed: passed, results: results });
                        callback(err);
                    });
                }
            ),
            (err) => {
                var end = Date.now();
                this.emit('scenarioEnd', { scenario: scenario, timeElapsed: end - start });
                callback(err);
            });
        });
    }
}

module.exports = TestRunner;