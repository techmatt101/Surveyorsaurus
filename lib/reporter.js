var chalk = require('chalk');
var Spinner = require('cli-spinner').Spinner;
var TestResults = require('./testResults');

var spinner;

function reporter(taskRunner) {
    taskRunner.on('start', function() {
        spinner = new Spinner(chalk.cyan('Running tests...') + ' %s');
        spinner.start();
    });

    taskRunner.on('end', function(data) {
        var testResults = new TestResults(data.scenarios);
        spinner.stop(true);
        console.log("");
        console.log('\t' + chalk.green(testResults.passed + ' passing'));
        console.log('\t' + chalk.red(testResults.failed + ' failing'));
        console.log("");
    });

    taskRunner.on('scenarioStart', function(data) {
        var scenario = data.scenario;
        log("\n " + scenario.description + ' ' + chalk.grey(scenario.id + ' (' + scenario.url + ')'));
    });

    taskRunner.on('scenarioEnd', function(data) {
        log(" " + chalk.grey('(' + getTimings(data.time) + ')'));
    });

    taskRunner.on('testEnd', function(data) {
        var test = data.test;
        var output = [];

        if(test.passed) {
            output.push(chalk.green(' + PASSED: ' + test.description));
        } else {
            output.push(chalk.red(' - FAILED: ' + test.description));
        }
        output.push("\n  ");
        if(test.compareResults === null) {
            output.push(chalk.yellow('No Previous History'));
        } else if(!test.passed) {
            output.push(chalk.magenta('Mismatch: ' + test.compareResults.misMatchPercentage + '%' + ((!test.compareResults.isSameDimensions) ? ', Dimension Difference: width ' + test.compareResults.dimensionDifference.width + 'px, height ' + test.compareResults.dimensionDifference.height + 'px' : '')))
        }
        output.push(chalk.grey(test.id + ' [' + test.element + ']'));
        log(output.join(' ') + "\n");
    });
}

function log(msg) {
    spinner.stop(true);
    console.info(msg);
    spinner.start();
}

function getTimings(time) {
    return time / 1000 + 's';
}

module.exports = reporter;