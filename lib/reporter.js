var chalk = require('chalk');
var Spinner = require('cli-spinner').Spinner;

function reporter(taskRunner) {
    var testSpinner;

    taskRunner.on('start', function(test) {
        testSpinner = new Spinner(chalk.blue('TEST RUNNING: ' + test.name) + ' ' + getTestDetails(test) + ' %s');
        testSpinner.start();
    });

    taskRunner.on('end', function(data) {
        var test = data.test;
        var results = data.results;
        testSpinner.stop(true);

        if(test.passed) {
            var msg = chalk.green('TEST PASSED: ' + test.name) + ' ' + getTestDetails(test);
            if(results === null) {
                msg += ' ' + chalk.yellow('No Previous History');
            }
            console.log(msg);
        } else {
            console.log(chalk.red('TEST FAILED: ' + test.name) + ' ' + getTestDetails(test) + ' ' + chalk.magenta('Mismatch: ' + results.misMatchPercentage + '%' + ((!results.isSameDimensions) ? ', Dimension Difference: Width: ' + results.dimensionDifference.width + ', Height: ' + results.dimensionDifference.height : '')));
        }
    });
}

function getTestDetails(test) {
    return chalk.dim('(' + test.url + ')' + ((test.element) ? '[' + test.element + ']' : ''));
}

module.exports = reporter;