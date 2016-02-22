"use strict";
var resemble = require('node-resemble.js');

class ImageComparison {
    constructor(testHistory) {
        this._testHistoryManager = testHistory
    }

    resemblesApproved(test, callback) {
        resemble(this._testHistoryManager.getCurrentScreenCapture(test))
            .compareTo(this._testHistoryManager.getApprovedScreenCapture(test))
            .onComplete((results) => {
                var passed = results.misMatchPercentage < test.mismatchPercentageLeeway;
                callback(null, passed, results);
            });
    }
}

module.exports = ImageComparison;