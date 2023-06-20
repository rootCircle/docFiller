function run() {
	let questions = new DocExtractorEngine().getValidQuestions();
}



class DocExtractorEngine {

	constructor() {
		// Generating enums to help getting 
		this.questionTypes = {
			singleLine: "SingleLine",
			multiLine: "MultiLine",
			mcq: "MCQ",
			mmcq: "MMCQ", // More than 1 correct
		}
	}

	getValidQuestions() {
		// Returns an Array of DOM objects of Boxes present in Google Form
		// Return Type : Array
		let questions = this.getQuestions();
		questions = this.validateQuestions(questions);
		this.detectType(questions);
		return questions;
	}

	getQuestions() {
		// Returns all the Boxes in Google Docs
		// But also as a garbage returns checkbox too
		// Returns a node list array, where each element is a DOM containing complete information for questions
		// Return Type : NodeList
		return document.querySelectorAll("div[role=listitem]");
	}

	validateQuestions(questions) {
		// Input Type : NodeList
		// Weeds out Checkbox collected as a false positive in getQuestions method
		// and returns only the correct ones
		// Return Type : Array
		return Array.prototype.slice.call(questions).filter(question => {
			return !this.isCheckBoxListItem(question)
		});
	}

	isCheckBoxListItem(element) {
		// Input Type : DOM object
		// Helper function for validateQuestions() method
		// that helps detect if DOM element is checkbox or not 
		// Return Type : Boolean
		let hasListRole = false;
		let parent = element.parentElement;

		while (parent && !hasListRole) {
			if (parent.getAttribute('role') === 'listitem') {
				hasListRole = true;
			}
			parent = parent.parentElement;
		}
		return hasListRole;
	}

	detectType(questions) {
		console.clear(); // Temporary code, while debugging
		let checker = new DetectBoxType();
		questions.forEach(question => {
			checker.detectType(question);
		});
	}
}


class DetectBoxType {
	// Detect Type of Input inside Box out of the 10 available inputs
	// Possible : Dropdown, Checkbox Grid, Date,
	//            Time, Multiple Choice, Paragraph,
	//            Multiple Choice Grid, Linear Scale,
	//            Text [number, email, phone, name, etc], Multicorrect 
	// In case of Error, it will returns null, with suitable output in console

	detectType(element) {
		// console.log("Dropdown : " + this.isDropdown(element));
		// console.log("Text : " + this.isText(element));
		// console.log("Paragraph : " + this.isParagraph(element));
		// console.log("Text Email : " + this.isTextEmail(element));
		// console.log("Text Numeric : " + this.isTextNumeric(element));
		// console.log("Text Telephonic : " + this.isTextTelephone(element));
		// console.log("MultiCorrect : " + this.isMultiCorrect(element));
		// console.log("Linear Scale : " + this.isLinearScale(element));
		// console.log("Multiple Choice : " + this.isMultipleChoice(element));
		// console.log("Multiple Choice Grid : " + this.isMultipleChoiceGrid(element));
	
		// console.log(element);
	}


	isDropdown(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Dropdown or not
		// Tweak : A dropdown has a div which has role = listbox in it.
		// Return Type : Boolean
		return Boolean(element.querySelector("div[role=listbox]"));
	}

	isText(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Text Field or not
		// Tweak : -  A text field has only one non-hidden input tag inside it.
		// 		   -  But checkbox as well as Linear Scale turns out to be 
		//         false positive to this check as they too have a input tag, but its hidden.
		//		   -  Also, date and time also has input tags, but number is non 1.
		//         -  MCQ seems to work even having an valid input tag, because of one extra hidden 
		//         input tag
		// Return Type : Boolean
		let inputFields = element.querySelectorAll("input");
		return inputFields.length === 1 && !(inputFields[0].getAttribute("type") === "hidden");
	}

	isParagraph(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Paragraph or not
		// Tweak : Paragraph will have a textarea tag inside the DOM object
		// Return Type : Boolean
		let inputFields = element.querySelector("textarea");
		return Boolean(inputFields);
	}

	isTextEmail(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Email Text Field or not
		// Tweak : The email text field will have input type as email
		// Return Type : Boolean
		return Boolean(element.querySelector("input[type=email"))
	}

	isTextNumeric(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Numeric Text Field or not
		// Tweak : The numeric text field will have input type as number
		// Return Type : Boolean
		return Boolean(element.querySelector("input[type=number"))
	}

	isTextTelephone(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Telephonic Text Field or not
		// Tweak : The telephonic text field will have input type as tel
		// Return Type : Boolean
		return Boolean(element.querySelector("input[type=tel"))
	}

	isMultiCorrect(element) {
		// Input Type : DOM object
		// Checks if given DOM object is a Multi Correct Field or not
		// which basically is a set of multiple checkboxes based MCQs
		// Tweak : Since as mentioned earlier in 
		//         DocExtractorEngine().validateQuestions() multi correct has 
		//         a div with `list` role 
		//         and child of that div has `listitem` role
		// Return Type : Boolean
		return Boolean(element.querySelector("div[role=list]"));
	}

	isLinearScale(element) {
		let optionBox = element.querySelector("div[role=radiogroup] label");
		return Boolean(optionBox && optionBox.querySelector("div") && !(optionBox.querySelector("span")));
	}
	
	isMultipleChoice(element) {
		return Boolean(element.querySelector("div[role=radiogroup] label span"));
	}

	isMultipleChoiceGrid(element) {

	}

}

// Calling main function
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

