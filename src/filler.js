// import the classes from here
import { FillerEngine } from './filler/engines/filler-engine';
import { DocExtractorEngine } from './filler/engines/doc-extractor-engine';
import { FieldsExtractorEngine } from './filler/engines/fields-extractor-engine';
import { DetectBoxType } from './filler/detectors/detect-box-type';
import { PromptEngine } from './filler/engines/prompt-engine';
import { ParserEngine } from './filler/engines/parser-engine';
import { GeneratorEngine } from './filler/engines/gpt-engine';
import GPTEngine from './utils/gpt-engines';

let debugging = true;
if (debugging) {
	main();
	debugging = false;
}

(async () => {
	// catch message from the extension

	browser.runtime.onMessage.addListener((message) => {
		// if message is FILL_FORM
		if (message.data === 'FILL_FORM') {
			// ----------------------------
			// execute the main() function
			main();
			// to prevent code from simultaneous multiple execution
			message.data = null;
		}
	});
})();

async function main() {
	console.log('in main run() function');
	let questions = new DocExtractorEngine().getValidQuestions();

	console.clear(); // Temporary code, while debugging
	let checker = new DetectBoxType();
	let fields = new FieldsExtractorEngine();
	let filler = new FillerEngine();
	let prompt = new PromptEngine();
	let gpt = new GeneratorEngine(GPTEngine.CHATGPT);
	let parser = new ParserEngine();

	questions.forEach((question) => {
		let fieldType = checker.detectType(question);
		if (fieldType !== null) {
			let fieldValue = fields.getFields(question, fieldType);
			let promptText = prompt.getPrompt(fieldType, fieldValue);
			Promise.resolve(gpt.getResponse(prompt)).then((response) => {
				let parsed_response = parser.parse(fieldType, fieldValue, response);

				// Using Dummy Value for brevity
				Promise.resolve(
					filler.fill(question, fieldType, fieldValue, 'Dummy Value'),
				).then((filled) => {
					console.log(question);

					console.log('Field Type : ' + fieldType);
					console.log('Fields ↴');

					console.log('Field Value ↴');
					console.log(fieldValue);

					console.log('Prompt for Model : ' + promptText);
					console.log('Response : ' + response);
					console.log('Parsed Response : ' + parsed_response);
					console.log('Filled : ' + filled);
					console.log();
				});
			});
		}
	});
}
