var fs = require('fs');
var path = require('path');
var prompt = require('co-prompt');
var deepExtend = require('deep-extend');
var chalk = require('chalk');
var argh = require('argh');

var testRunner = require('./lib/testRunner');

if (argh.argv.init) {
    console.log("Not supported yet :(");
    process.exit(0);
}

if (argh.argv.version) {
    printVersion();
    process.exit(0);
}

if (argh.argv.help) {
    printHelp();
    process.exit(0);
}

function printHelp() {
    printVersion();
    console.log("Options:");
    console.log(" --init        Create base config file for project");
    console.log(" --test        Run Tests");
    console.log(" --approve     Approve failed tests to past");
    console.log(" --skip        Skip annoying confirmation messages");
    console.log(" --version     Print version");
    console.log(" --help        Print help guide");
}

function printVersion() {
    var pjson = require('./package.json');
    console.log(pjson.name + ' v' + pjson.version);
}

loadConfig(((argh.argv.argv) ? argh.argv.argv[0] : 'surveyorsaurus.json'), function(configData) {
    if (argh.argv.approve) {
        testRunner.runTests(configData.tests, function(tests) {
            if (argh.argv.skip) {
                console.log("Oh...");
            }
            var failed = '';
            var failedTests = [];
            var failedLength = 0;
            for (var i = 0; i < tests.length; i++) {
                if (!tests[i].passed) {
                    failedTests.push(tests[i]);
                    failedLength++;
                    failed += chalk.inverse(tests[i].name) + ' ';
                }
            }
            if (failedLength === 0) {
                exit(tests);
            }
            prompt.confirm(chalk.cyan("Sure you want to approve the following " + failedLength + " tests? (y/n): \n") + failed + "\n")(function(err, yes) {
                if (err) throw err;
                if (yes) {
                    approve(failedTests, function(/*err*/) {
                        //if(err) throw err;
                        console.log(failedLength + " have been successfully approved!");
                        process.exit(0);

                    });
                } else {
                    console.log("Approval cancelled");
                    process.exit(0);
                }
            });
        });
    } else if (argh.argv.test) {
        if (typeof argh.argv.test === 'string') {
            var lookup = configData.keys[stringToId(argh.argv.test)];
            if (typeof lookup === 'undefined') {
                throw new Error("Can't find '" + argh.argv.test + "' test");
            }
            testRunner.runTests(configData.tests[lookup], exit);
        } else {
            testRunner.runTests(configData.tests, exit);
        }
    } else {
        printHelp();
    }
});

function approve(tests, callback) {
    if (!(tests instanceof Array)) tests = [tests];
    var i = 0;

    function loop() {
        var newFile = fs.createWriteStream('bin/previous/' + tests[i].id + '.png');
        newFile.on('finish', function() {
            i++;
            if (tests.length > i) {
                loop();
            } else {
                callback(tests);
            }
        });
        fs.createReadStream('bin/changed/' + tests[i].id + '.png').pipe(newFile);
    }

    loop();
}

function loadConfig(path, callback) {
    fs.readFile(path, 'utf8', function(err, configData) {
        try {
            if (err) throw err;
            configData = JSON.parse(configData);
            if (!(configData.scenarios instanceof Array)) {
                throw new Error("No Scenarios found in config!");
            }
            var keys = {};
            var tests = [];

            for (var i = 0; i < configData.scenarios.length; i++) {
                var scenario = configData.scenarios[i];
                if (typeof scenario.name === 'undefined') {
                    throw new Error("Scenario '" + i + "' must contain a name");
                }
                if (typeof scenario.url === 'undefined') {
                    throw new Error("Scenario '" + scenario.name + "' must contain a url");
                }
                // Mapping default values
                deepExtend({
                    tests: []
                }, scenario);

                for (var j = 0; j < scenario.tests.length; j++) {
                    var test = scenario.tests[j];
                    if (typeof test.name === 'undefined') {
                        throw new Error("Test '" + scenario.name + ':' + j + "' must contain a name");
                    }
                    test.name = scenario.name + ' ' + test.name;
                    test.id = stringToId(test.name);
                    if (typeof keys[test.id] !== 'undefined') {
                        throw new Error("Multiple test using name '" + test.name + "'. All tests must use a unique name.");
                    } else {
                        keys[test.id] = j;
                    }
                    // Mapping default values
                    tests.push(deepExtend({
                        url: scenario.url,
                        mismatchPercentageLeeway: configData.mismatchPercentageLeeway || scenario.mismatchPercentageLeeway || 0.01,
                        description: null,
                        element: null
                    }, test));
                }

            }
            configData.keys = keys;
            configData.tests = tests;
        } catch (e) {
            e.message = "Failed to load config file! \n  Reason: " + e.message;
            throw e;
        }
        callback(configData);
    });
}

function stringToId(string) {
    return string.replace(/[^a-z0-9]/gi, '-').toLowerCase();
}

function exit(tests) {
    var passed = 0, failed = 0;
    for (var i = 0; i < tests.length; i++) {
        (tests[i].passed) ? passed++ : failed++;
    }

    console.log(chalk.green("\n" + passed + " Tests Passed"));

    if (failed > 0) {
        console.log(chalk.red("\n" + failed + " Tests Failed"));
        process.exit(1);
    } else {
        process.exit(0);
    }
}