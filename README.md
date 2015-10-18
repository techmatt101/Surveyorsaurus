![Surveyorsaurus Logo](images/logo.png)

Simple CSS Regression Testing inspired by [csscritic](https://github.com/cburgmer/csscritic) and [PhantomCSS](https://github.com/Huddle/PhantomCSS)

## Install
    $ npm install surveyorsaurus -g

## Usage

### Terminal
    $ surveyorsaurus test

    Commands:
     test              Run all tests
     test <[tests..]>  Run specified tests
     version           Print version
     help              Print help guide
    
    Options:
     --config <file>   Config file path
     --approve         Approve failed tests to past
     --skip            Skip annoying confirmation messages
     
### Node
    var surveyorsaurus = require("surveyorsaurus");
    var testRunner = new surveyorsaurus.TestRunner();
    
## Config
```json
{
  "scenarios": {
    "example": {
      "description": "Example page",
      "url": "http://example.com/",
      "tests": {
        "content": {
          "description": "example content",
          "element": "div"
        }
      }
    }
  }
}
```
