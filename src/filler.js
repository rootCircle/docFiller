// import the classes from here
import { FillerEngine } from "./filler/engines/filler-engine";
import { DocExtractorEngine } from "./filler/engines/doc-extractor-engine";
import { FieldsExtractorEngine } from "./filler/engines/fields-extractor-engine";
import { DetectBoxType } from "./filler/detectors/detect-box-type";

(async () => {
  // catch message from the extension
  browser.runtime.onMessage.addListener((message) => {
    // if message is FILL_FORM
    if (message.data === "FILL_FORM") {
      // ----------------------------
      // execute the main() function
      console.log("in main run() function");
      let questions = new DocExtractorEngine().getValidQuestions();

      let checker = new DetectBoxType();
      let fields = new FieldsExtractorEngine();
      questions.forEach((question) => {
        console.log(question);
        console.log(checker.detectType(question));
        console.log(fields.getTitle(question));
        console.log(fields.getDescription(question));
        console.log();
      });
    }
  });
})();

// class FillerEngine {
// 	// Passes in the required field as form of input and fill in those values appropriately
// 	// via DOM

// 	constructor() {

// 	}

// }

///////////////////////////////////////////////////////////////////
// Dead Code down here. (Might be used later)
///////////////////////////////////////////////////////////////////

// // alert("Bruhhhhh multipler x10");
// var inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"]');

// console.log(document.querySelectorAll("div[role=radio]"))

// // Fill each input field with the value "bruh@gmail.com"
// // Missed one include textarea etc, radios, checkbox
// inputs.forEach(input => {
//   console.log(input)
//   input.value = "bruh@gmail.com";
//   var inputEvent = new Event('input', { bubbles: true });
//   input.dispatchEvent(inputEvent)
// });

// class Data {
//   constructor(pageNo, sectionID, data, questionStatement, assumedImageContext, outputType, value) {
//     this.pageNo = pageNo;
//     this.sectionID = sectionID;
//     this.data = data;
//     this.questionStatement = questionStatement;
//     this.assumedImageContext = assumedImageContext;
//     this.outputType = outputType;
//     this.value = value;
//   }
// }
