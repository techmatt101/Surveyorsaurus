var module = require("./lib/Surveyorsaurus");
module.TestRunner = require("./lib/test/TestRunner.js");
module.TestHistoryManager = require("./lib/test/TestHistoryManager.js");
module.ScreenshotDriver = require("./lib/screenshot/ScreenshotDriver.js");
module.AssertTest = require("./lib/test/AssertTest.js");
module.ImageComparison = require("./lib/test/ImageComparison.js");
module.TestCaseMapper = require("./lib/mappers/TestCaseMapper.js");
module.ScreenshotMapper = require("./lib/mappers/ScreenshotMapper.js");
module.Config = require('./lib/Config');

module.exports = module;