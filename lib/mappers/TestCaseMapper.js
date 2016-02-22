"use strict";

class TestCaseMapper {
    static mapScenarios(scenariosObj) {
        var scenarios = [];
        for (var key in scenariosObj) {
            scenarios.push(this.mapScenario(scenariosObj[key], key));
        }

        return scenarios;
    }

    static mapScenario(scenario, scenarioKey) {
        var tests = [];
        for (var testKey in scenario.tests) {
            tests.push(this.mapTest(scenario.tests[testKey], scenarioKey, testKey));
        }
        scenario.id = scenarioKey;
        scenario.tests = tests;

        return scenario;
    }

    static mapTest(test, scenarioKey, testKey) {
        test.id = scenarioKey + '-' + testKey;

        return test;
    }
}

module.exports = TestCaseMapper;