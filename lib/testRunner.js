var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var chalk = require('chalk');
var Spinner = require('cli-spinner').Spinner;
var phantomjs = require('phantomjs');
var resemble = require('node-resemble.js');

var binPath = phantomjs.path;

module.exports = {
    runTests: runTests,
    runTest: runTest
};

function takeScreenshot(url, output, element, callback) {
    var args = [path.join(__dirname, 'phantomjs-script.js'), url, output];
    if (element) args.push(element);
    childProcess.execFile(binPath, args, callback); //TODO: catch errors
}

function runTests(tests, callback) {
    if (!(tests instanceof Array)) tests = [tests];
    var i = 0;
    function loop() {
        runTest(tests[i], function() {
            i++;
            if (tests.length > i) {
                loop();
            } else {
                callback(tests);
            }
        });
    }

    loop();
}

function runTest(test, callback) {
    var details = chalk.dim('(' + test.url + ')' + ((test.element) ? '[' + test.element + ']' : ''));
    var testSpinner = new Spinner(chalk.blue('TEST RUNNING: ' + test.name) + ' ' + details + ' %s');
    testSpinner.start();

    function end(passed, msg) {
        testSpinner.stop(true);
        test.passed = passed;
        console.log(msg);
        callback();
    }

    fs.exists('bin/previous/' + test.id + '.png', function(exists) {
        var folder = (exists) ? 'changed' : 'previous';
        takeScreenshot(test.url, 'bin/' + folder + '/' + test.id + '.png', test.element, function() {
            if (exists) {
                resemble('bin/changed/' + test.id + '.png')
                    .compareTo('bin/previous/' + test.id + '.png')
                    .onComplete(function(results) {
                        var passed = results.misMatchPercentage < test.mismatchPercentageLeeway;
                        if (passed) {
                            end(true, chalk.green('TEST PASSED: ' + test.name) + ' ' + details);
                        } else {
                            var dist = fs.createWriteStream('bin/difference/' + test.id + '.png');
                            dist.on('finish', function() {
                                end(false, chalk.red('TEST FAILED: ' + test.name) + ' ' + details + ' ' + chalk.magenta('Mismatch: ' + results.misMatchPercentage + '%' + ((!results.isSameDimensions) ? ', Dimension Difference: Width: ' + results.dimensionDifference.width + ', Height: ' + results.dimensionDifference.height : '')));
                            });
                            results.getDiffImage().pack().pipe(dist);
                        }
                    });
            } else {
                if (!exists) details += ' ' + chalk.yellow('No Previous History');
                end(true, chalk.green('TEST PASSED: ' + test.name) + ' ' + details);
            }
        });
    });
}
