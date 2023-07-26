import QType from "../../utils/question-types";

export class FieldsExtractorEngine {
	// Extracts the questions and description from the DOM object and returns it
	// It might also extract the options in case of MCQs or other types, where answers do
	// play a  critical role

	constructor() { }

	getFields(element, fieldType) {
		let fields = { 
						"title": this.getTitle(element),
						"description": this.getDescription(element)
					}; 

		// Dynamic values like options can be appended based on field type

		if (fieldType === QType.DROPDOWN) {
			// Do something like call a function to extract value and then append it to fields
		}

		return fields;
	}

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
		if (required === undefined || required.textContent === "") {
			// console.log("There is no description for this box!");
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
		console.log("checkpoint1");
		// Remove trailing whitespace at the end
		return content.trimEnd();
	}




	 
// Function to extract options for a given question
  // Import DetectBoxType class

  getQuestionOptions(questionElement) {
	console.log("questionElement")
	const boxTypeDetector = new DetectBoxType();
	const questionType = boxTypeDetector.detectType(questionElement);
  
	if (!questionType) {
	  return []; // Return empty array for questions without options
	}
  
	switch (Object.keys(questionType)[0]) {
	  case QType.MULTIPLE_CHOICE:
	  case QType.MULTIPLE_CHOICE_WITH_OTHER:
		return this.getSingleChoiceOptions(questionElement);
	  case QType.MULTIPLE_CHOICE_GRID:
	  case QType.CHECKBOX_GRID:
		return this.getGridOptions(questionElement);
	  default:
		return [];
	}
  }
  

  getSingleChoiceOptions(questionElement) {
	const optionElements = questionElement.querySelectorAll('div[data-value]');
	const options = [];
	for (const optionElement of optionElements) {
	  const optionText = optionElement.textContent.trim();
	  options.push(optionText);
	}
	return options;
  }
  

  getGridOptions(questionElement) {
    const rowElements = questionElement.querySelectorAll('[role=row]');
    const colElements = questionElement.querySelectorAll('[role=cell]');
    const options = [];

    for (const rowElement of rowElements) {
      const rowLabel = rowElement.textContent.trim();
      const rowOptions = [];
      for (const colElement of colElements) {
        const colLabel = colElement.textContent.trim();
        rowOptions.push(colLabel);
      }
      options.push(rowOptions);
    }

    return options;
  }

  // Function to extract Linear scale bounds (left and right numbers)
  getLinearScaleBounds(questionElement) {
    const scaleLabels = questionElement.querySelectorAll('span[role=radio] span');
    if (scaleLabels.length >= 2) {
      const lowerBound = parseFloat(scaleLabels[0].textContent.trim());
      const upperBound = parseFloat(scaleLabels[scaleLabels.length - 1].textContent.trim());
      return [lowerBound, upperBound];
    }
    return [NaN, NaN]; // If bounds are not found, return NaN values
  }
	}
