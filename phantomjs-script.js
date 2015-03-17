var page = require('webpage').create();
var args = require('system').args;

page.open(args[1], function(status) {
    if (status !== 'success') {
        console.error('Unable to load the address!');
        phantom.exit();
    }
});

page.onLoadFinished = function() {
    if (args[3]) {
        var element = page.evaluate(function(q) {
            var element = document.querySelector(q);
            if (element == null) return;
            return {
                top: element.offsetTop,
                left: element.offsetLeft,
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        }, args[3]);
        if (!element) {
            console.error("Element '" + args[3] + "' not found");
            phantom.exit();
        }
        page.clipRect = { top: element.top, left: element.left, width: element.width, height: element.height };
    }
    page.render(args[2]);
    phantom.exit();
};