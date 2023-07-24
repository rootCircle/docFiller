export class FieldsExtractorEngine {
  // Extracts the questions and description from the DOM object and returns it
  // It might also extract the options in case of MCQs or other types, where answers do
  // play a  critical role

  constructor() {}

  // Testing on Different Forms required
	getTitle(element) {
		// Input Type: DOM Object
		// Extracts the title of the question
		// Tweak : - The extraction is based on the DOM tree
		//         - The required node is obtained by selecting the first child element of div with role=heading
		// Return Type : String
		let required = element.querySelector('div[role="heading"]');
		required = required.children[0];

		let content = "";

		// Every new line is either inside a div or independent, hence has nodeName #text
		Array.from(required.childNodes).forEach(element => {
			if (element.nodeName === '#text') {
				content += element.textContent + "\n";
			}
			else {
				content += element.textContent + "\n";
			}
		});

		// Remove trailing whitespace at the end
		return content.trimEnd();
	}

	// Testing on Different Forms required
	getDescription(element) {
		// Input Type: DOM Object
		// Extracts the description of the question
		// Tweak : - The extraction is based on the DOM tree
		//         - The required node is obtained by selecting the second child element of the parent element of div with role=heading
		// Return Type : String (Returns null if no description is found!)
		let required = element.querySelector('div[role="heading"]');
		required = required.parentElement.children[1];
		if(required === undefined || required.textContent === "") {
			console.log("There is no description for this box!");
			return null;
		}
		
		let content = "";

		// Every new line is either inside a div or independent, hence has nodeName #text
		Array.from(required.childNodes).forEach(element => {
			if (element.nodeName === '#text') {
				content += element.textContent + "\n";
			}
			else {
				content += element.textContent + "\n";
			}
		});

		// Remove trailing whitespace at the end
		return content.trimEnd();
	}
  
}
