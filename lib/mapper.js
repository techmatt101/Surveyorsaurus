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
        scenario.id = scenarioKey;
        var tests = [];
        for (var testKey in scenario.tests) {
            tests.push(this.mapTest(scenario.tests[testKey], scenarioKey, testKey));
        }
        scenario.tests = tests;

        return scenario;
    }

    static mapTest(test, scenarioKey, testKey) {
        test.id = scenarioKey + '-' + testKey;
        test.description = test.description || test.id;

        return test;
    }
}

module.exports = TestCaseMapper;