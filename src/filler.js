// import the classes from here
import { FillerEngine } from "./filler/engines/filler-engine";
import { DocExtractorEngine } from "./filler/engines/doc-extractor-engine";
import { FieldsExtractorEngine } from "./filler/engines/fields-extractor-engine";
import { DetectBoxType } from "./filler/detectors/detect-box-type";

async function run() {
  console.log("in main run() function");
  let questions = new DocExtractorEngine().getValidQuestions();

  console.clear(); // Temporary code, while debugging
	let checker = new DetectBoxType();
	let fields = new FieldsExtractorEngine();
	let filler = new FillerEngine();

	questions.forEach(question => {
		console.log(question);
		console.log(checker.detectType(question));
		console.log(fields.getTitle(question));
		console.log(fields.getDescription(question));

		// Using Dummy Value for brevity
		filler.fill(question, checker.detectType(question), "Dummy Value");
		console.log();
	});
}


// Calling main function
console.log("program ran now");
run();

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
