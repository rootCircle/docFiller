// import the classes from here
import { FillerEngine } from "./filler/engines/filler-engine";
import { DocExtractorEngine } from "./filler/engines/doc-extractor-engine";
import { FieldsExtractorEngine } from "./filler/engines/fields-extractor-engine";
import { DetectBoxType } from "./filler/detectors/detect-box-type";
import { PromptEngine } from "./filler/engines/prompt-engine";
import { ParserEngine } from "./filler/engines/parser-engine";
import GPTEngine from "./utils/gpt-engines";

let debugging = true;
if (debugging) {
	main();
	debugging = false;
}


(async () => {
	// catch message from the extension

	browser.runtime.onMessage.addListener((message) => {
		// if message is FILL_FORM
		if (message.data === "FILL_FORM") {
			// ----------------------------
			// execute the main() function
			main();
			// to prevent code from simultaneous multiple execution
			message.data = null;
		}
	});
})();


async function main() {
	console.log("in main run() function");
	let questions = new DocExtractorEngine().getValidQuestions();

	console.clear(); // Temporary code, while debugging
	let checker = new DetectBoxType();
	let fields = new FieldsExtractorEngine();
	let filler = new FillerEngine();
	let prompt = new PromptEngine(GPTEngine.CHATGPT);
	let parser = new ParserEngine();

	questions.forEach(question => {
		let fieldType = checker.detectType(question);
		if (fieldType !== null) {
			console.log(question)

			console.log("Field Type : " + fieldType);
			console.log("Fields ↴")
			
			let fieldValue = fields.getFields(question, fieldType);
			
			console.log("Field Value ↴")
			console.log(fieldValue);
			
			
			let promptText = prompt.prompt(fieldType, fieldValue);
            console.log("Prompt for Model : " + promptText);
			
			let response = prompt.getResponse(fieldType, fieldValue);

			console.log("Response : " + response);

			let parsed_response = parser.parse(fieldType, fieldValue, response);
			console.log("Parsed Response : " + parsed_response)

			// Using Dummy Value for brevity
			filler.fill(question, fieldType, fieldValue, "Dummy Value");
		}
		console.log();
	});

}





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
