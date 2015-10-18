if (require.main === module) {
    require('./lib/cli');
}
else {
    module.exports = {
        TestRunner: require('./lib/testRunner'),
        TestResults: require('./lib/testResults'),
        config: require('./lib/config'),
        mapper: require('./lib/mapper')
    };
}