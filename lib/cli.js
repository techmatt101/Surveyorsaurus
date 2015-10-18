var async = require('async');
var confirm = require('confirm-simple');
var argh = require('argh');

var TestRunner = require('./testRunner');
var TestResults = require('./testResults');
var reporter = require('./reporter');
var config = require('./config');
var mapper = require('./mapper');

switch (argh.argv.argv ? argh.argv.argv[0] : null) {
    case 'version':
        printVersion();
        process.exit(0);
        break;

    case 'help':
        printHelp();
        process.exit(0);
        break;

    case 'test':
        runTests();
        break;

    default:
        console.log("Unknown option '" + argh.argv.argv + "'");
        printOptions();
        process.exit(0);
}

function printHelp() {
    printVersion();
    printOptions();
}

function printOptions() {
    console.log("\nCommands:");
    console.log(" test              Run all tests");
    console.log(" test <[tests..]>  Run specified tests");
    console.log(" version           Print version");
    console.log(" help              Print help guide");

    console.log("\nOptions:");
    console.log(" --config <file>   Config file path");
    console.log(" --approve         Approve failed tests to past");
    console.log(" --skip            Skip annoying confirmation messages");
}

function printVersion() {
    var pjson = require('../package.json');
    console.log(pjson.name + ' v' + pjson.version);
}

function runTests() {
    config.load(argh.argv.config || 'surveyorsaurus.json', function(configData) {
        var scenarios = mapper.mapScenarios(configData.scenarios);
        var testIds = argh.argv.argv.slice(1, argh.argv.argv.length);
        if (testIds.length > 0) {
            scenarios = scenarios.filter(function(scenario) {
                return testIds.indexOf(scenario.id) !== -1;
            });
        }
        var testRunner = new TestRunner();
        reporter(testRunner);

        testRunner.runScenarios(scenarios, function(err, scenarioResults) {
            if (err) throw err;
            var testsResults = new TestResults(scenarioResults);

            if (argh.argv.approve) {
                approveTests(testsResults, testRunner);
            } else {
                exit(testsResults);
            }
        });
    });
}

function approveTests(testsResults, testRunner) {
    async.series(testsResults.failedTests.map(function(test) {
        return function(callback) {
            approveTest(test, testRunner, callback);
        };
    }), function(err, approved) {
        if (err) throw err;
        var numberApproved = approved.filter(function(approved) {
            return approved;
        }).length;
        console.log("\n\t" + numberApproved + " approved");
        process.exit(0);
    });
}

function approveTest(test, testRunner, callback) {
    if (argh.argv.skip) {
        testRunner.approveTest(test, function(err) {
            callback(err, true);
        });
    } else {
        confirm("Do you want to approve '" + test.id + "' test?", ['y', 'n'], function(yes) {
            if (yes) {
                testRunner.approveTest(test, function(err) {
                    callback(err, true);
                });
            } else {
                callback(null, false);
            }
        });
    }
}

function exit(testsResults) {
    process.exit((testsResults.failed > 0) ? 1 : 0);
}