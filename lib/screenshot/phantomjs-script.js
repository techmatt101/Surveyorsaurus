var page = require('webpage').create();
var args = require('system').args;

var instruction = JSON.parse(args[1]);

page.open(instruction.url, function(status) {
    if (status !== 'success') {
        console.error('Unable to load the address!');
        phantom.exit();
    }
});

page.onLoadFinished = function() {
    for (var i = 0; i < instruction.elements.length; i++) {
        var element = instruction.elements[i];
        var dimensions = page.evaluate(function(q) {
            var element = document.querySelector(q);
            if (element === null) return;
            return {
                top: element.offsetTop,
                left: element.offsetLeft,
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        }, element.selector);

        if (!dimensions) {
            console.error("Element '" + element.selector + "' not found");
            phantom.exit();
        }

        page.clipRect = {
            top: dimensions.top,
            left: dimensions.left,
            width: dimensions.width,
            height: dimensions.height
        };
        page.render(element.renderDest);
    }
    phantom.exit();
};