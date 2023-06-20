function run() {
	let questions = new docExtractorEngine().getValidQuestions();
	console.log(typeof(questions[1]));
}



class docExtractorEngine {

	docExtractorEngine() {
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

	detectType(element) {

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

