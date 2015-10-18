var fs = require('fs');
var resemble = require('node-resemble.js');

var ImageComparison = function(testHistory) {
    this._testHistory = testHistory;
};

ImageComparison.prototype.compareTest = function(test, callback) {
    var _self = this;
    fs.exists(this._testHistory.getApprovedScreenCapture(test), function(hasTestHistory) {
        if (hasTestHistory) {
            resemble(_self._testHistory.getCurrentScreenCapture(test))
                .compareTo(_self._testHistory.getApprovedScreenCapture(test))
                .onComplete(function(results) {
                    var passed = results.misMatchPercentage < test.mismatchPercentageLeeway;
                    callback(passed, results);
                });
        } else {
            callback(true, null);
        }
    });
};

module.exports = ImageComparison;