"use strict";
var fs = require('fs');
var resemble = require('node-resemble.js');

class ImageComparison {
    constructor(testHistory) {
        this._testHistory = testHistory
    }

    compareTest (test, callback) {
        fs.exists(this._testHistory.getApprovedScreenCapture(test), (hasTestHistory) => {
            if (hasTestHistory) {
                resemble(this._testHistory.getCurrentScreenCapture(test))
                    .compareTo(this._testHistory.getApprovedScreenCapture(test))
                    .onComplete((results) => {
                        var passed = results.misMatchPercentage < test.mismatchPercentageLeeway;
                        callback(passed, results);
                    });
            } else {
                callback(true, null);
            }
        });
    }
}

module.exports = ImageComparison;