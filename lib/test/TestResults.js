"use strict";

class TestResults {
    constructor(scenarios) {
        this.scenarios = scenarios;

        this.passedScenarios = [];
        this.passedTests = [];

        this.failedScenarios = [];
        this.failedTests = [];

        for (var i = 0; i < scenarios.length; i++) {
            var scenario = scenarios[i];
            var scenarioPassed = cloneScenario(scenario);
            var scenarioFailed = cloneScenario(scenario);

            for (var j = 0; j < scenario.tests.length; j++) {
                var test = scenario.tests[j];
                if(test.passed) {
                    scenarioPassed.tests.push(test);
                    this.passedTests.push(test);
                } else {
                    scenarioFailed.tests.push(test);
                    this.failedTests.push(test);
                }
            }
            if(scenarioPassed.tests.length > 0) {
                this.passedScenarios.push(scenarioPassed);
            }
            if(scenarioFailed.tests.length > 0) {
                this.failedScenarios.push(scenarioFailed);
            }
        }

        this.passed = this.passedTests.length;
        this.failed = this.failedTests.length;
    }
}

function cloneScenario(obj) {
    var newObj = {};
    for(var key in obj) {
        newObj[key] = obj[key];
    }
    newObj.tests = [];
    return newObj;
}

module.exports = TestResults;
