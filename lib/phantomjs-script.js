var page = require('webpage').create();
var args = require('system').args;

var scenario = JSON.parse(args[1]);
var outpath = args[2];

page.open(scenario.url, function(status) {
    if (status !== 'success') {
        console.error('Unable to load the address!');
        phantom.exit();
    }
});

page.onLoadFinished = function() {
    for (var i = 0; i < scenario.tests.length; i++) {
        var test = scenario.tests[i];
        var element = page.evaluate(function(q) {
            var element = document.querySelector(q);
            if (element === null) return;
            return {
                top: element.offsetTop,
                left: element.offsetLeft,
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        }, test.element);

        if (!element) {
            console.error("Element '" + test.element + "' not found");
            phantom.exit();
        }

        page.clipRect = { top: element.top, left: element.left, width: element.width, height: element.height };
        page.render(outpath + test.id + '.png');
    }
    phantom.exit();
};