function printHelp() {
    printVersion();
    printOptions();
}

function printOptions() {
    console.log("\nOptions:");
    console.log(" test              Run all tests");
    console.log(" test <[tests..]>  Run specified tests");
    console.log(" version           Print version");
    console.log(" help              Print help guide");
    console.log(" --config <file>   Config file path");
    console.log(" --approve         Approve failed tests to past");
    console.log(" --skip            Skip annoying confirmation messages");
}

function printVersion() {
    var pjson = require('../package.json');
    console.log(pjson.name + ' v' + pjson.version);
}

module.exports = {
    help: printHelp,
    version: printVersion,
    options: printOptions
};