"use strict";
var chalk = require('chalk');
var Spinner = require('cli-spinner').Spinner;
var TestResults = require('./../lib/test/TestResults');

var spinner;

class Reporter {
    static listen(taskRunner) {
        taskRunner.on('start', () => {
            spinner = new Spinner(chalk.cyan('Running tests...') + ' %s');
            spinner.start();
        });

        taskRunner.on('end', (data) => {
            var testResults = new TestResults(data.scenarios);
            spinner.stop(true);
            console.log("");
            console.log('\t' + chalk.green(testResults.passed + ' passing'));
            console.log('\t' + chalk.red(testResults.failed + ' failing'));
            console.log("");
        });

        taskRunner.on('scenarioStart', (data) => {
            var scenario = data.scenario;
            log("\n " + scenario.description + ' ' + chalk.grey(scenario.id + ' (' + scenario.url + ')'));
        });

        taskRunner.on('scenarioEnd', (data) => {
            log(" " + chalk.grey('(' + getTimings(data.timeElapsed) + ')'));
        });

        taskRunner.on('testEnd', (data) => {
            var output = [];
            var test = data.test;
            test.passed = data.passed;
            test.results = data.results;

            if(test.passed) {
                output.push(chalk.green(' + PASSED: ' + test.description));
            } else {
                output.push(chalk.red(' - FAILED: ' + test.description));
            }
            output.push("\n  ");
            if(test.results === null) {
                output.push(chalk.yellow('No Previous History'));
            } else if(!test.passed) {
                output.push(chalk.magenta('Mismatch: ' + test.results.misMatchPercentage + '%' + ((!test.results.isSameDimensions) ? ', Dimension Difference: width ' + test.results.dimensionDifference.width + 'px, height ' + test.results.dimensionDifference.height + 'px' : '')))
            }
            output.push(chalk.grey(test.id + ' [' + test.element + ']'));
            log(output.join(' ') + "\n");
        });
    }
}

function log(msg) {
    spinner.stop(true);
    console.info(msg);
    spinner.start();
}

function getTimings(time) {
    return time / 1000 + 's';
}

module.exports = Reporter;