"use strict";
var path = require('path');

class ScreenshotMapper {
    static mapScenarioToInstruction(scenario, dest) {
        return {
            url: scenario.url,
            elements: scenario.tests.map(test => {
                return {
                    selector: test.element,
                    renderDest: path.join(dest, test.id + '.png')
                };
            })
        };
    }
}

module.exports = ScreenshotMapper;