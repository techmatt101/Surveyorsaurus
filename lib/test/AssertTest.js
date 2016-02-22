"use strict";

class AssertTest {
    constructor(testHistoryManager, imageComparison) {
        this._testHistoryManager = testHistoryManager;
        this._imageComparison = imageComparison;
    }

    test(test, callback) {
        this._testHistoryManager.hasApprovedTest(test, (hasApprovedTest) => {
            if(!hasApprovedTest) {
                this._testHistoryManager.approveTest(test, (err) => callback(err, test, true, null));
                return;
            }

            this._imageComparison.resemblesApproved(test, (err, passed, results) => {
                if (err) return callback(err, test, false, null);
                if (passed === true) {
                    callback(null, test, true, results);
                } else {
                    this._testHistoryManager.saveDifference(test, results.getDiffImage(), (err) => callback(err, test, false, results));
                }
            });
        });
    }
}

module.exports = AssertTest;