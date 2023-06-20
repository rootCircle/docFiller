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
		// console.log("Checkbox Grid : " + this.isCheckboxGrid(element));
    // console.log("Date : " + this.isDate(element))
    // console.log("DateAndTime:"+this.isDateAndTime(element))
    //  console.log("Time:"+this.isTime(element))
    // console.log("Duration:"+this.isDuration(element))
    // console.log("Datewithoutyear:"+this.isDateWithoutYear(element))
    // console.log("DatewithoutyearWithTime:"+this.isDateWithoutYearWithTime(element))
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
		//           `group` role for containing row.
		//         - But for extra sanctity we had added label field,
		//           which actually houses the checkbox inside a div with `checkbox` role
		// Return Type : Boolean
		return Boolean(element.querySelector("div[role=group] label div[role=checkbox]"));
	}

	isMultipleChoiceGrid(element) {

	}

	isDate(element)
	{
  
	  // Input Type : DOM object
		  // given DOM object is Text Field
		  // Tweak : This div should contain Year,Month, and Day inputs, so we are checking if these input fields are present and other input fields like Hour , Minutes should not be present.
		  // Return Type : Boolean
  
	  let isYear=Boolean(element.querySelector('input[aria-label="Year"]'))
	  let isMonth=Boolean(element.querySelector('input[aria-label="Month"]'))
	  let Day_of_the_month =Boolean(element.querySelector('input[aria-label="Day of the month"]'))
	  let Hour=Boolean(element.querySelector('input[aria-label="Hour"]'));
	  let Minute=Boolean(element.querySelector('input[aria-label="Minute"]'));
	  return Boolean(isYear===true && isMonth===true && Day_of_the_month===true && Hour===false && Minute===false);
	}
  
  
	isDateAndTime(element)
	{
  
	  // Input Type : DOM object
		  // given DOM object is Text Field
		  // Tweak : This div should contain Year,Month,Day,Hour,Minute inputs.
		  // Return Type : Boolean
  
	  let isYear=Boolean(element.querySelector('input[aria-label="Year"]'))
	  let isMonth=Boolean(element.querySelector('input[aria-label="Month"]'))
	  let Day_of_the_month =Boolean(element.querySelector('input[aria-label="Day of the month"]'))
	  let Hour=Boolean(element.querySelector('input[aria-label="Hour"]'));
	  let Minute=Boolean(element.querySelector('input[aria-label="Minute"]'));
	  return Boolean(isYear===true && isMonth===true && Day_of_the_month===true && Hour===true && Minute===true);
	}
  
	isTime(element)
	{
  
	  // Input Type : DOM object
		  // given DOM object is Text Field
		  // Tweak : This div should only contain Hour and Minute inputs, and should not contain Year Month and Day inputs.
		  // Return Type : Boolean
  
	  let isYear=Boolean(element.querySelector('input[aria-label="Year"]'))
	  let isMonth=Boolean(element.querySelector('input[aria-label="Month"]'))
	  let Day_of_the_month =Boolean(element.querySelector('input[aria-label="Day of the month"]'))
	  let Hour=Boolean(element.querySelector('input[aria-label="Hour"]'));
	  let Minute=Boolean(element.querySelector('input[aria-label="Minute"]'));
	  return Boolean(isYear===false && isMonth===false && Day_of_the_month===false && Hour===true && Minute===true);
	}
	
	isDuration(element)
  {

     // Input Type : DOM object
		// given DOM object is Text Field
		// Tweak : This div should only contain Hours,Minutes,Seconds inputs, and should not contain Year Month and Day inputs.
		// Return Type : Boolean

    let isYear=Boolean(element.querySelector('input[aria-label="Year"]'))
    let isMonth=Boolean(element.querySelector('input[aria-label="Month"]'))
    let Day_of_the_month =Boolean(element.querySelector('input[aria-label="Day of the month"]'))
    let Hours=Boolean(element.querySelector('input[aria-label="Hours"]'));
    let Minutes=Boolean(element.querySelector('input[aria-label="Minutes"]'));
    let Seconds=Boolean(element.querySelector('input[aria-label="Seconds"]'));
    return Boolean(isYear===false && isMonth===false && Day_of_the_month===false && Hours===true && Minutes===true && Seconds===true);
  }

  isDateWithoutYear(element)
  {

    // Input Type : DOM object
		// given DOM object is Text Field
		// Tweak : This div should only contain Month and Day inputs, and should not contain Year,Hour,Minute and Second.
		// Return Type : Boolean

    let isYear=Boolean(element.querySelector('input[aria-label="Year"]'))
    let isMonth=Boolean(element.querySelector('input[aria-label="Month"]'))
    let Day_of_the_month =Boolean(element.querySelector('input[aria-label="Day of the month"]'))
    let Hour=Boolean(element.querySelector('input[aria-label="Hour"]'));
    let Minute=Boolean(element.querySelector('input[aria-label="Minute"]'));
    let Second=Boolean(element.querySelector('input[aria-label="Second"]'));
    return Boolean(isYear===false && isMonth===true && Day_of_the_month===true && Hour===false && Minute===false && Second===false);
  }

  isDateWithoutYearWithTime(element)
  {

    // Input Type : DOM object
		// given DOM object is Text Field
		// Tweak : This div should only contain Month,Day,Hour,Minute inputs, and should not contain Second
		// Return Type : Boolean

    let isYear=Boolean(element.querySelector('input[aria-label="Year"]'))
    let isMonth=Boolean(element.querySelector('input[aria-label="Month"]'))
    let Day_of_the_month =Boolean(element.querySelector('input[aria-label="Day of the month"]'))
    let Hour=Boolean(element.querySelector('input[aria-label="Hour"]'));
    let Minute=Boolean(element.querySelector('input[aria-label="Minute"]'));
    let Second=Boolean(element.querySelector('input[aria-label="Second"]'));
    return Boolean(isYear===false && isMonth===true && Day_of_the_month===true && Hour===true && Minute===true && Second===false);
  }


  isTimeWithAmPm(element)
  {

    // Input Type : DOM object
		// given DOM object is Text Field
		// Tweak : This div should only contain Hour and Minute and Am or Pm options, and should not contain Year Month and Day inputs.
    // Return Type : Boolean

    //******************************************************************************************************* */
    //we are not checking Am Pm in other function in future we will make these values false in other function containing time.
    //******************************************************************************************************* */

    let isYear=Boolean(element.querySelector('input[aria-label="Year"]'))
    let isMonth=Boolean(element.querySelector('input[aria-label="Month"]'))
    let Day_of_the_month =Boolean(element.querySelector('input[aria-label="Day of the month"]'))
    let Hour=Boolean(element.querySelector('input[aria-label="Hour"]'));
    let Minute=Boolean(element.querySelector('input[aria-label="Minute"]'));
    let Am= Boolean(temp5.querySelector('input[data-value="AM"]'));
    let Pm= Boolean(temp6.querySelector('input[data-value="PM"]'));
    let Role= Boolean(temp6.querySelector('input[role="option"]'));

    return Boolean(isYear===false && isMonth===false && Day_of_the_month===false && Hour===true && Minute===true  &&((Am===true || Pm===true) && Role===true));
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

