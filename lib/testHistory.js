"use strict";
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var async = require('async');
var defaultTo = require('deep-extend');

class TestHistory {
    constructor(config) {
        this.config = {
            approvedDirPath: 'surveyorsaurus/approved/',
            currentDirPath: 'surveyorsaurus/current/',
            differenceDirPath: 'surveyorsaurus/difference/'
        };
        defaultTo(this.config, config);
    }

    getDifferenceScreenCapture (test) {
        return path.join(this.config.differenceDirPath, this._getFile(test));
    }

    getCurrentScreenCapture (test) {
        return path.join(this.config.currentDirPath, this._getFile(test));
    }

    getApprovedScreenCapture (test) {
        return path.join(this.config.approvedDirPath, this._getFile(test));
    }

    _getFile (test) {
        return test.id + '.png';
    }

    setUpFolders(callback) {
        async.parallel([
            this.config.currentDirPath,
            this.config.approvedDirPath,
            this.config.differenceDirPath
        ].map((path) => (cb) => mkdirp(path, cb)), callback);
    }

    saveDifference(test, imageDiffStream, callback) {
        var dist = fs.createWriteStream(this.getDifferenceScreenCapture(test));
        dist.on('finish', callback);
        imageDiffStream.pack().pipe(dist);
    }

    approveTest(test, callback) {
        var newFile = fs.createWriteStream(this.getApprovedScreenCapture(test));
        newFile.on('finish', callback);
        fs.createReadStream(this.getCurrentScreenCapture(test)).pipe(newFile);
    }
}

module.exports = TestHistory;