![Surveyorsaurus Logo](images/logo.png)

Simple CSS Regression Testing inspired by [csscritic](https://github.com/cburgmer/csscritic) and [PhantomCSS](https://github.com/Huddle/PhantomCSS)

## Install
    $ npm install surveyorsaurus -g

## Usage

### Terminal
    $ surveyorsaurus

    Commands:
     test              Run all tests
     test <[tests..]>  Run specified tests
     version           Print version
     help              Print help guide
    
    Options:
     --config <file>   Config file path (defaults to surveyorsaurus.json)
     --approve         Approve failing tests to pass
     --skip            Skip annoying confirmation messages when approving failing tests
     
### Node
    var Surveyorsaurus = require("surveyorsaurus");
    
    var surveyorsaurus = new Surveyorsaurus();

    surveyorsaurus.load(configFile, function(err) {
        surveyorsaurus.run(function(err, testResults) {
            console.log(testResults);
        });
    });
    
## Config
```json
surveyorsaurus.json
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

## API
// TODO: WIP

## Roadmap
- Web App Reporter
- Better docs
- test Test TESTS!!!


