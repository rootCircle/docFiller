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

class DetectBoxTypeTimeCacher {
	// A Cacher Engine for Date/Time based field boxes
	// This can help eliminate calling multiple same DOM queries repeatedly
	// Value validation is based on the argument, not the output

	constructor() {
		// Initializing all values to null
		this.element = null;
		this.inputFieldCount = null;
		this.hasYear = null;
		this.hasMonth = null;
		this.hasDate = null;
		this.hasHour = null;
		this.hasMinute = null;
		this.hasSecond = null;
		this.hasMeridiemField = null;
	}

	getTimeParams(element, invalidateCache = false) {
		// DOM queries are only run, if forced to or if cache was not created for the element 
		if (element !== this.element || invalidateCache) {
			// Storing input argument and output simultaneously	
			this.element = element;
			this.inputFieldCount = element.querySelectorAll("input").length;
			this.hasYear = Boolean(element.querySelector('input[aria-label="Year"]'));
			this.hasMonth = Boolean(element.querySelector('input[aria-label="Month"]'));
			this.hasDate = Boolean(element.querySelector('input[aria-label="Day of the month"]'));
			this.hasHour = Boolean(element.querySelector('input[aria-label="Hour"]'));
			this.hasMinute = Boolean(element.querySelector('input[aria-label="Minute"]'));
			this.hasSecond = Boolean(element.querySelector('input[aria-label="Seconds"]'));

			// Works the same with data-value=PM
			this.hasMeridiemField = Boolean(element.querySelector("div[role=option][data-value=AM]"));
		}
		// else {
		// 	console.log("Using cached Values for DetectBoxTypeTimeCacher");
		// }

		// Returns an array of argument, which can be later unpacked
		return [this.inputFieldCount, this.hasYear, this.hasMonth, this.hasDate, this.hasHour, this.hasMinute, this.hasSecond, this.hasMeridiemField];
	}


}

class DetectBoxType {
	// Detect Type of Input inside Box out of the 10 available inputs
	// Possible : Dropdown, Checkbox Grid, Date,
	//            Time, Multiple Choice, Paragraph,
	//            Multiple Choice Grid, Linear Scale,
	//            Text [number, email, phone, name, etc], Multicorrect 
	// In case of Error, it will returns null, with suitable output in console

	constructor() {
		this.timeCacher = new DetectBoxTypeTimeCacher();
	}

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
		// console.log("Checkbox Grid : " + this.isCheckboxGrid(element));
		// console.log("Date : " + this.isDate(element))
		// console.log("DateAndTime:"+this.isDateAndTime(element))
		// console.log("Time:"+this.isTime(element))
		// console.log("Duration:"+this.isDuration(element))
		// console.log("Date without Year:"+this.isDateWithoutYear(element))
		// console.log("Date without Year with Time:"+this.isDateWithoutYearWithTime(element))
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
		//            false positive to this check as they too have a input tag, but its hidden.
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

	isTextURL(element) {
		// Input Type : DOM object
		// Checks if given DOM object is URL Text Field or not
		// Tweak : The URL text field will have input type as url
		// Return Type : Boolean
		return Boolean(element.querySelector("input[type=url"))
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
		// Input Type : DOM object
		// Checks if given DOM object is a Linear Scale Field or not
		// which basically is a set of radio buttons but in 1D
		// Tweak : - The Linear Scale being horizontal in view had label 
		//           and option box (technically a div rather than an input)
		//           in top-bottom layout, so they must be contained inside in div
		//           and properties like span will have no significance for DOM object
		//           for each option pair.
		//         - We could easily get to option as they are grouped inside a label
		//         - Similar to Multiple Choice and Multiple Choice Grid, Linear Scale
		//           too follows inside an div with `radiogroup` role, so this might help
		//           in preliminary filters.
		// Return Type : Boolean
		let optionBox = element.querySelector("div[role=radiogroup] label");
		return Boolean(optionBox && optionBox.querySelector("div") && !(optionBox.querySelector("span")));
	}

	isMultipleChoice(element) {
		// Input Type : DOM object
		// Checks if given DOM object is a Multiple Choice Field or not
		// which basically is a set of radio buttons but in 1D
		// Tweak : - The Linear Scale being vertical w.r.t. options in view had label 
		//           and option box in left-right layout.
		//           So, they must be contained inside in a <span> tag
		//         - We could easily get to option as they are grouped inside a label
		//         - Similar to Linear Scale and Multiple Choice Grid, Multiple Choice
		//           too follows inside an div with `radiogroup` role, so this might help
		//           in preliminary filters.
		// Return Type : Boolean
		return Boolean(element.querySelector("div[role=radiogroup] label span"));
	}

	isCheckboxGrid(element) {
		// Input Type : DOM object
		// Checks if given DOM object is a Checkbox Grid or not
		// which basically is a set of row column matching based on checkboxes in 2D
		// Tweak : - Checkbox Grid are grouped horizontally for each row
		//           It was shocking for us to know that each row have
		//           `group` role for each containing row in a div.
		//         - But for extra sanctity we had added label field check,
		//           which actually houses the checkbox inside a div with `checkbox` role
		// Return Type : Boolean
		return Boolean(element.querySelector("div[role=group] label div[role=checkbox]"));
	}

	isMultipleChoiceGrid(element) {
		// UNSTABLE [Refer Tweak for details]
		// Input Type : DOM object
		// Checks if given DOM object is a Multiple Choice Grid or not
		// which basically is a set of row column matching based on radio buttons in 2D
		// Tweak : - Multiple Grid are grouped horizontally for each row
		//           It was expectedly known that each row have
		//           `radiogroup` role for each containing row.
		//         - Inside that div houses a span with `presentation` role still housing the entire row
		//         - But same features is realized for Multiple Choice and Linear Scale
		//         - So, To differentiate we had to extract rendered style properties for that span.
		//           And hence, you guessed it right, any design changes done externally will make this
		//           unusable.
		//         - To differentiate, we are checking display property for rendered span to be `table-row`.
		//           Other two wiz, Multiple Choice and Linear Scale has display property to be flex.
		//         - It eventually means, any external extension redesigning the page may break this function.
		//         - For being extra pedantic, we ensure that child of that spans actually has radio buttons
		//           which is a div with role `radio`
		// Return Type : Boolean
		let radioGroups = element.querySelector("div[role=radiogroup] span[role=presentation]");
		let hasTableRowDisplay = window.getComputedStyle(radioGroups).display === "table-row";
		return Boolean(radioGroups && hasTableRowDisplay && radioGroups.querySelector("div[role=radio]"));
	}

	isDate(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Date Field or not.
		// It will validate existence of Date, Month and Year Fields in the Box
		// Tweak : - We are using aria-labels to check for fields like
		//           date, month, hour etc. We believe aria-label to be very consistent 
		//           and should not change dramatically over time.
		//         - As box should contain year, month and date inputs, 
		//           so we are checking if these input fields are present 
		//           and other input fields like hour, minutes should not be present.
		//         - We are counting upon number of input fields, just to be extra pedantic
		// Return Type : Boolean
		let [inputFieldCount, hasYear, hasMonth, hasDate, hasHour, hasMinute, hasSecond, hasMeridiemField] = this.timeCacher.getTimeParams(element);

		return (inputFieldCount === 3 && hasYear && hasMonth && hasDate && !hasHour && !hasMinute && !hasSecond && !hasMeridiemField);
	}


	isDateAndTime(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Date and Time Field or not.
		// It will validate existence of Date, Month, Year, Hour and Minute Fields in the Box
		// Tweak : - We are using aria-labels to check for fields like
		//           date, month, hour etc. We believe aria-label to be very consistent 
		//           and should not change dramatically over time.
		//         - As box should contain year, month, date, hour and minute inputs, 
		//           so we are checking if these input fields are present 
		//           and other input fields like meridiem field should not be present.
		//         - We are counting upon number of input fields, just to be extra pedantic
		// Return Type : Boolean
		let [inputFieldCount, hasYear, hasMonth, hasDate, hasHour, hasMinute, hasSecond, hasMeridiemField] = this.timeCacher.getTimeParams(element);

		return (inputFieldCount === 5 && hasYear && hasMonth && hasDate && hasHour && hasMinute && !hasSecond && !hasMeridiemField);
	}

	isTime(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Time Field or not.
		// It will validate existence of Hour and Minute Fields in the Box
		// Tweak : - We are using aria-labels to check for fields like
		//           hour etc. We believe aria-label to be very consistent 
		//           and should not change dramatically over time.
		//         - As box should contain hour and minute inputs, 
		//           so we are checking if these input fields are present 
		//           and other input fields like date, month etc should not be present.
		//         - We are counting upon number of input fields, just to be extra pedantic
		// Return Type : Boolean
		let [inputFieldCount, hasYear, hasMonth, hasDate, hasHour, hasMinute, hasSecond, hasMeridiemField] = this.timeCacher.getTimeParams(element);

		return (inputFieldCount === 2 && !hasYear && !hasMonth && !hasDate && hasHour && hasMinute && !hasSecond && !hasMeridiemField);
	}

	isDuration(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Duration Field or not.
		// It will validate existence of Hours and Minutes Fields in the Box
		// Tweak : - We are using aria-labels to check for fields like
		//           date, month, hours etc. We believe aria-label to be very consistent 
		//           and should not change dramatically over time.
		//         - As box should contain hours and minutes inputs, 
		//           so we are checking if these input fields are present 
		//           and other input fields like meridiem field should not be present.
		//         - It is important to notice that the hour field has aria-label as `Hours`,
		//           and minute field as `Minutes`. Emphasis on extra `s`,
		//           absent in rest other hour/minute field
		//         - We are counting upon number of input fields, just to be extra pedantic
		// Return Type : Boolean
		let [inputFieldCount, hasYear, hasMonth, hasDate, hasHour, hasMinute, hasSecond, hasMeridiemField] = this.timeCacher.getTimeParams(element);

		// Overwriting hasHour and hasMinutes as cached values has no significance to us. 
		// aria-label for Hour & Minute is different for Duration Check
		hasHour = Boolean(element.querySelector('input[aria-label="Hours"]'));
		hasMinute = Boolean(element.querySelector('input[aria-label="Minutes"]'));

		return (inputFieldCount === 3 && !hasYear && !hasMonth && !hasDate && hasHour && hasMinute && hasSecond && !hasMeridiemField);
	}

	isDateWithoutYear(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Date and Time Field or not.
		// It will validate existence of Date, Month, Year, Hour and Minute Fields in the Box
		// Tweak : - We are using aria-labels to check for fields like
		//           date, month, hour etc. We believe aria-label to be very consistent 
		//           and should not change dramatically over time.
		//         - As box should contain year, month, date, hour and minute inputs, 
		//           so we are checking if these input fields are present 
		//           and other input fields like meridiem field should not be present.
		//         - We are counting upon number of input fields, just to be extra pedantic
		// Return Type : Boolean
		let [inputFieldCount, hasYear, hasMonth, hasDate, hasHour, hasMinute, hasSecond, hasMeridiemField] = this.timeCacher.getTimeParams(element);

		return (inputFieldCount === 2 && !hasYear && hasMonth && hasDate && !hasHour && !hasMinute && !hasSecond && !hasMeridiemField);
	}

	isDateWithoutYearWithTime(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Date without Year and Time Field or not.
		// It will validate existence of Date, Month, Hour and Minute Fields in the Box
		// Tweak : - We are using aria-labels to check for fields like
		//           date, month, hour etc. We believe aria-label to be very consistent 
		//           and should not change dramatically over time.
		//         - As box should contain month, date, hour and minute inputs, 
		//           so we are checking if these input fields are present 
		//           and other input fields like meridiem field should not be present.
		//         - We are counting upon number of input fields, just to be extra pedantic
		// Return Type : Boolean
		let [inputFieldCount, hasYear, hasMonth, hasDate, hasHour, hasMinute, hasSecond, hasMeridiemField] = this.timeCacher.getTimeParams(element);

		return (inputFieldCount === 4 && !hasYear && hasMonth && hasDate && hasHour && hasMinute && !hasSecond && !hasMeridiemField);
	}


	isTimeWithMeridiem(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Time Field or not with Meridiem Field.
		// It will validate existence of Hour, Minute and Meridiem Fields in the Box
		// Tweak : - We are using aria-labels to check for fields like
		//           hour, minute etc. We believe aria-label to be very consistent 
		//           and should not change dramatically over time.
		//         - As box should contain hour, minute and meridiem inputs, 
		//           so we are checking if these input fields are present 
		//           and other input fields like date, month etc should not be present.
		//         - We are counting upon number of input fields, just to be extra pedantic
		//         - To check Meridiem Fields we are checking if there is a div with role `option`,
		//           having data-value equals `AM` (or `PM`). There are two such div, satisfying 
		//           AM and PM respectively.
		// Return Type : Boolean
		let [inputFieldCount, hasYear, hasMonth, hasDate, hasHour, hasMinute, hasSecond, hasMeridiemField] = this.timeCacher.getTimeParams(element);

		return (inputFieldCount === 3 && !hasYear && !hasMonth && !hasDate && hasHour && hasMinute && hasSecond && hasMeridiemField);
	}

	isDateWithoutYearWithTimeAndMeridiem(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Date without Year and Time Field or not having Meridiem Fields.
		// It will validate existence of Date, Month, Hour, Minute and Meridiem Fields in the Box
		// Tweak : - We are using aria-labels to check for fields like
		//           date, month, hour etc. We believe aria-label to be very consistent 
		//           and should not change dramatically over time.
		//         - As box should contain month, date, hour, minute and meridiem inputs, 
		//           so we are checking if these input fields are present 
		//           and other input fields like year should not be present.
		//         - We are counting upon number of input fields, just to be extra pedantic
		//         - To check Meridiem Fields we are checking if there is a div with role `option`,
		//           having data-value equals `AM` (or `PM`). There are two such div, satisfying 
		//           AM and PM respectively.
		// Return Type : Boolean
		let [inputFieldCount, hasYear, hasMonth, hasDate, hasHour, hasMinute, hasSecond, hasMeridiemField] = this.timeCacher.getTimeParams(element);

		return (inputFieldCount === 4 && !hasYear && hasMonth && hasDate && hasHour && hasMinute && !hasSecond && hasMeridiemField);
	}

	isDateAndTimeWithMeridiem(element) {
		// Input Type : DOM object
		// Checks if given DOM object is Date and Time Field or not having meridiem fields.
		// It will validate existence of Date, Month, Year, Hour, Minute and Meridiem Fields in the Box
		// Tweak : - We are using aria-labels to check for fields like
		//           date, month, hour etc. We believe aria-label to be very consistent 
		//           and should not change dramatically over time.
		//         - As box should contain year, month, date, hour, minute and meridiem field inputs, 
		//           so we are checking if these input fields are present 
		//           and other input fields like seconds should not be present.
		//         - We are counting upon number of input fields, just to be extra pedantic
		//         - To check Meridiem Fields we are checking if there is a div with role `option`,
		//           having data-value equals `AM` (or `PM`). There are two such div, satisfying 
		//           AM and PM respectively.
		// Return Type : Boolean
		let [inputFieldCount, hasYear, hasMonth, hasDate, hasHour, hasMinute, hasSecond, hasMeridiemField] = this.timeCacher.getTimeParams(element);

		return (inputFieldCount === 4 && hasYear && hasMonth && hasDate && hasHour && hasMinute && !hasSecond && hasMeridiemField);
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

