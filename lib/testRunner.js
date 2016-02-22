"use strict";
var async = require('async');
var EventEmitter = require('events').EventEmitter;

class TaskRunner extends EventEmitter {
    constructor(testHistory, screenshotRunner, imageComparison) {
        super();
        this._testHistory = testHistory;
        this._screenshotRunner = screenshotRunner;
        this._imageComparison = imageComparison;
    }

    runScenarios(scenarios, callback) {
        var start = Date.now();
        this.emit('start', { scenarios: scenarios });

        async.series([
            this._testHistory.setUpFolders.bind(this._testHistory)
        ].concat(scenarios.map((scenario) =>
            (callback) => this.runScenario(scenario, callback))
        ), (err) => {
            var end = Date.now();
            this.emit('end', { scenarios: scenarios, time: end - start });
            callback(err, scenarios);
        });
    }

    runScenario(scenario, callback) {
        var start = Date.now();
        this.emit('scenarioStart', { scenario: scenario });

        this._screenshotRunner.takeScenarioScreenshots(scenario, this._testHistory.config.currentDirPath, (response, err) => {
            if (err) {
                err.message = "BROWSER ERROR: " + err.message;
                callback(err);
                return;
            }
            this._runTestsChecks(scenario.tests, (err) => {
                var end = Date.now();
                this.emit('scenarioEnd', { scenario: scenario, time: end - start });
                callback(err);
            });
        });
    }

    _runTestsChecks(tests, callback) {
        async.series(tests.map((test) => {
            return (callback) => {
                this.emit('testStart', { test: test });
                this._imageComparison.compareTest(test, (passed, results) => {
                    test.passed = passed;
                    test.compareResults = results;
                    this.emit('testEnd', { test: test, passed: passed, results: results });
                    if (results === null) {
                        this._testHistory.approveTest(test, callback);
                    } else if (passed === false) {
                        this._testHistory.saveDifference(test, results.getDiffImage(), callback);
                    } else {
                        callback();
                    }
                });
            };
        }), callback);
    };
}

module.exports = TaskRunner;