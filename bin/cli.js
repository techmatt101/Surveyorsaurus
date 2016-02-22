#!/usr/bin/env node
var fs = require('fs');
var async = require('async');
var confirm = require('confirm-simple');
var argh = require('argh');

var config = require('../lib/Config');
var Reporter = require('./reporter');
var Surveyorsaurus = require("../lib/Surveyorsaurus");


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
    fs.readFile(argh.argv.config || 'surveyorsaurus.json', 'utf8', (err, configFile) => {
        if (err) throwFileError(err);
        var surveyorsaurus = new Surveyorsaurus();

        surveyorsaurus.load(configFile, (err) => {
            if(err) throw err;

            Reporter.listen(surveyorsaurus.testRunner);

            var testIds = argh.argv.argv.slice(1, argh.argv.argv.length);
            if (testIds.length > 0) {
                surveyorsaurus.scenarios = surveyorsaurus.scenarios.filter((scenario) => {
                    return testIds.indexOf(scenario.id) !== -1;
                });
            }

            surveyorsaurus.run((err, testResults) => {
                if(err) throw err;
                if (argh.argv.approve) {
                    approveTests(testResults, surveyorsaurus.testHistory);
                } else {
                    exit(testResults);
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
    async.series(testsResults.failedTests.map((test) =>
        (callback) => approveTest(test, testHistory, callback)
    ), (err, approved) => {
        if (err) throw err;
        var numberApproved = approved.filter((approved) => approved).length;
        console.log("\n\t" + numberApproved + " approved");
        process.exit(0);
    });
}

function approveTest(test, testHistory, callback) {
    if (argh.argv.skip) {
        testHistory.approveTest(test, (err) => callback(err, true));
    } else {
        confirm("Do you want to approve '" + test.id + "' test?", ['y', 'n'], (yes) => {
            if (yes) {
                testHistory.approveTest(test, (err) => callback(err, true));
            } else {
                callback(null, false);
            }
        });
    }
}

function exit(testsResults) {
    process.exit((testsResults.failed > 0) ? 1 : 0);
}