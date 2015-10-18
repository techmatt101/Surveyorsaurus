var fs = require('fs');
var async = require('async');
var confirm = require('confirm-simple');
var argh = require('argh');

var TestRunner = require('./testRunner');
var ImageComparison = require('./imageComparison');
var ScreenshotRunner = require('./screenshotRunner');
var TestHistory = require('./testHistory');
var TestResults = require('./testResults');
var reporter = require('./reporter');
var config = require('./config');

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
    fs.readFile(argh.argv.config || 'surveyorsaurus.json', 'utf8', function(err, configFile) {
        if (err) throwFileError(err);
        var configJson;
        try {
            configJson = JSON.parse(configFile);
        } catch (err) {
            throwFileError(err);
        }

        config.validate(configJson, function(err, configData) {
            if(err) throw err;
            var scenarios = configData.scenarios;
            var testIds = argh.argv.argv.slice(1, argh.argv.argv.length);
            if (testIds.length > 0) {
                scenarios = scenarios.filter(function(scenario) {
                    return testIds.indexOf(scenario.id) !== -1;
                });
            }
            var testHistory = new TestHistory();
            var testRunner = new TestRunner(testHistory, new ScreenshotRunner(), new ImageComparison(testHistory));
            reporter(testRunner);

            testRunner.runScenarios(scenarios, function(err, scenarioResults) {
                if (err) throw err;
                var testsResults = new TestResults(scenarioResults);

                if (argh.argv.approve) {
                    approveTests(testsResults, testHistory);
                } else {
                    exit(testsResults);
                }
            });
        });
    });
}

function throwFileError(err) {
    err.message = "Failed to load config file! \n" + err.message;
    throw err;
}

function approveTests(testsResults, testHistory) {
    async.series(testsResults.failedTests.map(function(test) {
        return function(callback) {
            approveTest(test, testHistory, callback);
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

function approveTest(test, testHistory, callback) {
    if (argh.argv.skip) {
        testHistory.approveTest(test, function(err) {
            callback(err, true);
        });
    } else {
        confirm("Do you want to approve '" + test.id + "' test?", ['y', 'n'], function(yes) {
            if (yes) {
                testHistory.approveTest(test, function(err) {
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