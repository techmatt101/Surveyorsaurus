function mapScenarios(scenariosObj) {
    var scenarios = [];
    for (var key in scenariosObj) {
        scenarios.push(mapScenario(scenariosObj[key], key));
    }
    return scenarios;
}

function mapScenario(scenario, scenarioKey) {
    scenario.id = scenarioKey;
    var tests = [];
    for (var testKey in scenario.tests) {
        tests.push(mapTest(scenario.tests[testKey], scenarioKey, testKey));
    }
    scenario.tests = tests;
    return scenario;
}

function mapTest(test, scenarioKey, testKey) {
    test.id = scenarioKey + '-' + testKey;
    test.description = test.description || test.id;
    return test;
}

module.exports = {
    mapScenarios: mapScenarios,
    mapScenario: mapScenario,
    mapTest: mapTest
};