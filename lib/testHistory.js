var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var async = require('async');
var defaultTo = require('deep-extend');

var TestHistory = function(config) {
    this.config = {
        approvedDirPath: 'surveyorsaurus/approved/',
        currentDirPath: 'surveyorsaurus/current/',
        differenceDirPath: 'surveyorsaurus/difference/'
    };
    defaultTo(this.config, config);
};

TestHistory.prototype.getDifferenceScreenCapture = function(test) {
    return path.join(this.config.differenceDirPath, this._getFile(test));
};

TestHistory.prototype.getCurrentScreenCapture = function(test) {
    return path.join(this.config.currentDirPath, this._getFile(test));
};

TestHistory.prototype.getApprovedScreenCapture = function(test) {
    return path.join(this.config.approvedDirPath, this._getFile(test));
};

TestHistory.prototype._getFile = function(test) {
    return test.id + '.png';
};

TestHistory.prototype.setUpFolders = function(callback) {
    async.parallel([
        this.config.currentDirPath,
        this.config.approvedDirPath,
        this.config.differenceDirPath
    ].map(function(path) {
        return function(callback) {
            mkdirp(path, callback);
        }
    }), callback);
};

TestHistory.prototype.saveDifference = function(test, imageDiffStream, callback) {
    var dist = fs.createWriteStream(this.getDifferenceScreenCapture(test));
    dist.on('finish', callback);
    imageDiffStream.pack().pipe(dist);
};

TestHistory.prototype.approveTest = function(test, callback) {
    var newFile = fs.createWriteStream(this.getApprovedScreenCapture(test));
    newFile.on('finish', callback);
    fs.createReadStream(this.getCurrentScreenCapture(test)).pipe(newFile);
};


module.exports = TestHistory;