import QType from '../../utils/question-types';

export class FieldsExtractorEngine {
	// Extracts the questions and description from the DOM object and returns it
	// It might also extract the options in case of MCQs or other types, where answers do
	// play a  critical role

	getFields(element, fieldType) {
		let fields = {
			title: this.getTitle(element),
			description: this.getDescription(element),
		};

		// Dynamic values like options can be appended based on field type
		// Get options based on the field type and append them to the 'fields' object

		// this sets the required fields itself, the conditional checking is done in the function itself
		// the function is is highly abstracted

		// TODO : the getOptions() can be broken down into further functions if needed, just ensure that the return type is consistent so that the below line still works
		let optionFields = this.getParams(fieldType, element);
		fields = { ...fields, ...optionFields };

		return fields;
	}

	getParams(questionType, element) {
		// Function for Extracting Options
		// Input Type: DOM Object
		// Extracts the options of the question
		// ! Return Type : An object containing the options field and its required value
		// ! the return object may contain field other than options, as returned by the corresponding QuestionType

		switch (questionType) {
			// Extracting the options if the field type is MultiCorrect
			case QType.MULTI_CORRECT:
				return this.getParamsMultiCorrect(element);

			// Extracting the options if the field type is MultiCorrect_WITH_OTHER

			case QType.MULTI_CORRECT_WITH_OTHER:
				// We get options in the form of an OBJECT which has two properties
				//1. options - which contain options array
				//2. other - which contain `other:` which need to deal in separate way to ask Chatbot

				return this.getParamsMultiCorrectWithOther(element);

			// Extracting the options if the field type is 'Multiple Choice'

			case QType.MULTIPLE_CHOICE:
				return this.getParamsMultipleChoice(element);

			// Extracting the options if the field type is 'Multiple Choice With Other'.

			case QType.MULTIPLE_CHOICE_WITH_OTHER:
				// We get options in the form of an OBJECT which has two properties
				//1. options - which contain options array
				//2. other - which contain `other:` which need to deal in separate way to ask Chatbot

				return this.getParamsMultipleChoiceWithOther(element);

			// Extracting the options if the field type is 'Linear Scale'

			case QType.LINEAR_SCALE:
				//We get options in an object {filteredOptions,filterLowerUpper}
				//In Linear_Scale Left and Right Bounds are given and options are distributed uniformly between these bounds.
				//These elements which we are saying Upper_bound and Lower_bound may be strings or characters.

				/*
        Note
        We added one more attribute to fields `lowerUpperBounds` whose value will have an array containing LowerBound,UpperBound.
        */
				return this.getParamsLinearScale(element);

			// Extracting the options if the field type is `Checkbox Grid` or `Multiple Choice Grid`
			case QType.CHECKBOX_GRID:
				return this.getParamsCheckboxGrid(element);

			case QType.MULTIPLE_CHOICE_GRID:
				//We get options in form of an object
				//This object will contain 2 arrays 'rowsArray' and `columnsArray` which contains `row values` and `column values` respectively
				return this.getParamsMultipleChoiceGrid(element);

			// Extracting the options if the field type is Dropdown
			case QType.DROPDOWN:
				return this.getParamsDropdown(element);

			// Extracting the options if the field type is 'Text'.
			case QType.TEXT:
				//
				return this.getDomText(element);

			// Extracting the options if the field type is 'Paragraph'.
			case QType.PARAGRAPH:
				return this.getDomTextParagraph(element);

			// Extracting the options if the field type is 'Email'.
			case QType.TEXT_EMAIL:
				return this.getDomTextEmail(element);

			// Extracting the options if the field type is 'Text Numeric'.
			case QType.TEXT_NUMERIC:
				return this.getDomText(element);

			// Extracting the options if the field type is 'Text Telephonic'.
			case QType.TEXT_TEL:
				return this.getDomTextTel(element);

			// Extracting the options if the field type is 'Text URL'.
			case QType.TEXT_URL:
				return this.getDomTextUrl(element);

			// Extracting the options if the field type is 'Date'.
			case QType.DATE:
				return this.getDomDate(element);

			// Extracting the options if the field type is 'Date And Time'.
			case QType.DATE_AND_TIME:
				return this.getDomDateAndTime(element);

			// Extracting the options if the field type is 'Time'.
			case QType.TIME:
				return this.getDomTime(element);

			// Extracting the options if the field type is 'Duration'.
			case QType.DURATION:
				return this.getDomDuration(element);

			// Extracting the options if the field type is 'Date without Year'.
			case QType.DATE_WITHOUT_YEAR:
				return this.getDomDateWithoutYear(element);

			// Extracting the options if the field type is 'Date without Year with Time'.
			case QType.DATE_TIME_WITHOUT_YEAR:
				return this.getDomDateTimeWithoutYear(element);

			// Extracting the options if the field type is 'Date with Time and Meridiem'.
			case QType.DATE_TIME_WITH_MERIDIEM:
				return this.getDomDateTimeWithMeridiem(element);

			// Extracting the options if the field type is 'Time and Meridiem'.
			case QType.TIME_WITH_MERIDIEM:
				return this.getDomTimeWithMeridiem(element);

			// Extracting the options if the field type is 'Date without Year with Time and Meridiem'.
			case QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR:
				return this.getDomDateTimeWithMeridiemWithoutYear(element);
		}

		return null;
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

		let content = '';

		// Every new line is either inside a div or independent, hence has nodeName #text
		Array.from(required.childNodes).forEach((elm) => {
			if (elm.nodeName === '#text') {
				content += elm.textContent + '\n';
			} else {
				content += elm.textContent + '\n';
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
		if (required === undefined || required.textContent === '') {
			// console.log("There is no description for this box!");
			return null;
		}

		let content = '';

		// Every new line is either inside a div or independent, hence has nodeName #text
		Array.from(required.childNodes).forEach((elm) => {
			if (elm.nodeName === '#text') {
				content += elm.textContent + '\n';
			} else {
				content += elm.textContent + '\n';
			}
		});
		// console.log("checkpoint1");
		// Remove trailing whitespace at the end
		return content.trimEnd();
	}

	// Functions for Extracting Options
	//Extracting the options for field type = MultiCorrect With Other or MultiCorrect
	getParamsMultiCorrect(element) {
		// Input Type: DOM Object
		// Extracts the options of the question
		// Tweak : - The extraction is based on the DOM tree
		//         - The required node is obtained by selecting the span as options were inside them , also these span has dir="auto"
		// Return Type : Array (containing option's data) =>null if no options are present

		const optionLabels = element.querySelectorAll('span[dir="auto"]');
		if (!optionLabels || optionLabels.length === 0) {
			// If no option labels are found, return an empty array
			return { options: [] };
		}

		//Extracting divs which has radio buttons.
		const superDivs = element.querySelectorAll('div[role="checkbox"]');
		const clickElements = [];
		//For each option child of 2nd child of superDivs' div will contain a div whose 1st child is responsible on selecting an option.
		//By using click() method on clickDiv.firstElementChild which we pushed in array 'ClickElements' will mark that particular option
		superDivs.forEach((optionDiv) => {
			const thirdDiv = optionDiv.children[2];
			const clickDiv = thirdDiv.firstElementChild;
			clickElements.push(clickDiv.firstElementChild);
		});
		const options = [];
		const optionData = [];
		//we will go through all spans and extract its text content and store in our answer array as optionData.
		optionLabels.forEach((label) => {
			optionData.push(label.textContent.trim());
		});

		if (
			clickElements.length > 0 &&
			clickElements.length === optionData.length
		) {
			for (let i = 0; i < clickElements.length; i++) {
				options.push({ data: optionData[i], dom: clickElements[i] });
			}
		}

		return { options: options };
	}

	getParamsMultiCorrectWithOther(element) {
		// Input Type: DOM Object
		// Extracts the options of the question
		// Tweak : - The extraction is based on the DOM tree
		//         - The required node is obtained by selecting the span as options were inside them , also these span has dir="auto"
		// Return Type : OBJECT which has two properties
		//1. options - which contain options array
		//2. other - which contain `other:` which need to deal in separate way to ask Chatbot
		//it will contain an input field and in case no option match , we need to write our answer there

		const optionLabels = element.querySelectorAll('span[dir="auto"]');
		if (!optionLabels || optionLabels.length === 0) {
			// If no option labels are found, return an empty array
			return { options: [] };
		}

		//Extracting divs which has role=checkbox.
		const superDivs = element.querySelectorAll('div[role="checkbox"]');
		const clickElements = [];
		//For each option child of 2nd child of superDivs' div will contain a div which is responsible on selecting an option.
		//By using click() method on clickDiv which we pushed in array 'ClickOption' will mark that particular option
		superDivs.forEach((optionDiv) => {
			const thirdDiv = optionDiv.children[2];
			const clickDiv = thirdDiv.firstElementChild;
			clickElements.push(clickDiv.firstElementChild);
		});

		const options = [];
		const optionData = [];
		//we will go through all spans and extract its text content and store in an array.
		optionLabels.forEach((label) => {
			optionData.push(label.textContent.trim());
		});
		// Remove the last option and add 'other_option' field in the object, `other_option` is itself an object containing option_data, option_dom,inputBoxDom
		const lastOptionIndex = optionData.length - 1;
		const otherOption = optionData.splice(lastOptionIndex, 1)[0];
		// console.log(otherOption)
		const other_option = [];
		if (
			clickElements.length > 0 &&
			clickElements.length === optionData.length + 1
		) {
			for (let i = 0; i < clickElements.length - 1; i++) {
				options.push({ data: optionData[i], dom: clickElements[i] });
			}
			const input_in_mcwo = element.querySelector('input[dir="auto"]'); // mcwo is an acronym for multi choice with others
			other_option.push({
				data: otherOption,
				dom: clickElements[clickElements.length - 1],
				inputBoxDom: input_in_mcwo,
			});
		}

		return { options: options, other: other_option };
	}

	//Extracting the options for field type = MultipleChoice With Other or MultipleChoice
	getParamsMultipleChoice(element) {
		// Input Type: DOM Object
		// Extracts the options of the question
		// Tweak : - The extraction is based on the DOM tree
		//         - The required node is obtained by selecting the span as options were inside them , also these span has dir="auto"
		// Return Type : Array (containing option's data) =>null if no options are present

		const optionLabels = element.querySelectorAll('span[dir="auto"]');
		if (!optionLabels || optionLabels.length === 0) {
			// If no option labels are found, return an empty array
			return { options: [] };
		}

		//Extracting divs which has radio buttons.
		const superDivs = element.querySelectorAll('div[role="radio"]');
		const clickElements = [];
		//For each option child of 2nd child of superDivs' div will contain a div which is responsible on selecting an option.
		//By using click() method on clickDiv which we pushed in array 'ClickOption' will mark that particular option
		superDivs.forEach((optionDiv) => {
			const thirdDiv = optionDiv.children[2];
			const clickDiv = thirdDiv.firstElementChild;
			clickElements.push(clickDiv);
		});

		const options = [];
		const optionData = [];
		//we will go through all spans and extract its text content and store in option_data array.
		optionLabels.forEach((label) => {
			optionData.push(label.textContent.trim());
		});

		if (
			clickElements.length > 0 &&
			clickElements.length === optionData.length
		) {
			for (let i = 0; i < clickElements.length; i++) {
				options.push({ data: optionData[i], dom: clickElements[i] });
			}
		}

		return { options: options };
	}

	getParamsMultipleChoiceWithOther(element) {
		// Input Type: DOM Object
		// Extracts the options of the question
		// Tweak : - The extraction is based on the DOM tree
		//         - The required node is obtained by selecting the span as options were inside them , also these span has dir="auto"
		// Return Type : OBJECT which has two properties
		//1. options - which contain options array
		//2. other - which contain `other:` which need to deal in separate way to ask Chatbot
		//it will contain an input field and in case no option match , we need to write our answer there

		const optionLabels = element.querySelectorAll('span[dir="auto"]');
		if (!optionLabels || optionLabels.length === 0) {
			// If no option labels are found, return an empty array
			return { options: [] };
		}

		//Extracting divs which has radio buttons.
		const superDivs = element.querySelectorAll('div[role="radio"]');
		const clickElements = [];
		//For each option child of 2nd child of superDivs' div will contain a div which is responsible on selecting an option.
		//By using click() method on clickDiv which we pushed in array 'ClickOption' will mark that particular option
		superDivs.forEach((optionDiv) => {
			const thirdDiv = optionDiv.children[2];
			const clickDiv = thirdDiv.firstElementChild;
			clickElements.push(clickDiv.firstElementChild);
		});

		const options = [];
		const optionData = [];
		//we will go through all spans and extract its text content and store in our answer array.
		optionLabels.forEach((label) => {
			optionData.push(label.textContent.trim());
		});

		// console.log(optionData)
		// Remove the last option and add 'Other' field in the object
		const lastOptionIndex = optionData.length - 1;
		const otherOption = optionData.splice(lastOptionIndex, 1)[0];
		// console.log(otherOption)
		const otherDom = [];
		if (
			clickElements.length > 0 &&
			clickElements.length === optionData.length + 1
		) {
			for (let i = 0; i < clickElements.length - 1; i++) {
				options.push({ data: optionData[i], dom: clickElements[i] });
			}
			const input_in_mcwo = element.querySelector('input[dir="auto"]'); // mcwo is an acronym for multiple choice with others

			otherDom.push({
				data: otherOption,
				dom: clickElements[clickElements.length - 1],
				inputBoxDom: input_in_mcwo,
			});
		}

		return { options: options, other: otherDom };
	}

	//Extracting the options for field type = LinearScale
	getParamsLinearScale(element) {
		// Input Type: DOM Object
		// Extracts the options of the question
		// Tweak : - The extraction is based on the DOM tree
		//         - The required node for Lower and Upper bound is obtained by selecting the span whose role="presentation" and then need to traverse more
		//since no attribute can be found which can help
		//         -Option are present in in divs inside elements which has dir="auto".
		// Return Type : Object containing two arrays - {filterLowerUpper,filteredOptions}
		//filterLowerUpper- ArraySize=2 , contain lowerBound , upperBound
		//filteredOptions- It will contain options.

		let elementsWithHierarchy = element
			.querySelector('span[role="presentation"]')
			.querySelectorAll('div > div:last-child > div:last-child');
		let lowerBound = null;
		let upperBound = null;

		const superDivs = element.querySelectorAll('div[role="radio"]');
		const domsArray = [];

		superDivs.forEach((optionDiv) => {
			const thirdDiv = optionDiv.children[2];
			const clickDiv = thirdDiv.firstElementChild;
			const targetDom = clickDiv.firstElementChild;
			domsArray.push(targetDom);
		});

		//In elementWithHierarchy many nodes are present but we are sure 1st node is Lower bound and last node is Upper bound.
		elementsWithHierarchy.forEach((el) => {
			const textContent = el.textContent.trim();
			if (lowerBound === null && textContent !== '') {
				lowerBound = textContent; //Assigning lowerBound with 1st node
			} else if (lowerBound !== null && textContent !== '') {
				upperBound = textContent; //Assigning upperBound with each node we are at during traversal so last node will be assigned to upperBound.
			}
		});
		// Extracting the options from element
		const optionElements = element.querySelectorAll('div[dir="auto"]');
		const options = Array.from(optionElements).map((optionElement) =>
			optionElement.textContent.trim(),
		);

		// Iterate over domsArray and create object and store in optionsArray
		const optionsArray = [];
		if (domsArray.length > 0) {
			let j = 0;
			for (let i = 0; i < options.length; i++) {
				if (options[i] !== '')
					optionsArray.push({ data: options[i], dom: domsArray[j++] });
			}
		}

		// Storing LowerBound and UpperBound data
		const lowerUpperBound = { lowerBound, upperBound };

		// Filter out any null or empty string elements from the array.
		// const filterLowerUpper = lowerUpperBound.filter(item => item !== null && item !== '');

		return { bounds: lowerUpperBound, options: optionsArray };
	}

	//Extracting the options for field type = Multiple Choice Grid.
	getParamsMultipleChoiceGrid(element) {
		// Input Type: DOM Object
		// Extracts the options of the question
		// Tweak : - The extraction is based on the DOM tree
		//         - The required node is founded by Brute-force traversing no attribute can be found to be helpful.
		//
		// Return Type : Object containing 2 array
		//               - 1st array will denote contents of row1,row2,row3...
		//               - 2nd array will denote contents of column1,column2,column3

		//No property can be found so need to traverse this way only!
		let path =
			'div:first-child > div:first-child > div:nth-child(2) > div:first-child > div:nth-child(2) > div';

		//After getting to this path,
		//its first child contains a div which contains all columns.
		// and rest divs were for rows
		//But between each row there was an empty div so we need to extract 2nd,4th,6th.. i.e even numbered divs**
		const rows = element.querySelectorAll('div[role=radiogroup]');
		const columns = element.querySelectorAll(`${path}:first-child > div`);

		//In these columns if we think in term of matrix then (0,0) place is left vacant so we sliced form 1 and take out content of each column.
		const columnsArray = Array.from(columns)
			.slice(1)
			.map((column) => column.textContent.trim());
		const rowsArray = Array.from(rows).map((row) => row.textContent.trim());

		//Returning an Object containing 2 array
		//      - 1st array will denote contents of row1,row2,row3...
		//      -2nd array will denote contents of column1,column2,column3
		let optionsArray = [];
		rows.forEach((row) => {
			const childColumns = row.querySelectorAll('div[role="radio"]');
			const rowColumns = [];

			childColumns.forEach((column) => {
				const targetDom = column;

				rowColumns.push(targetDom);
			});

			optionsArray.push(rowColumns); //option array will contain those buttons which we mark.
		});

		let optionDom = [];
		for (let i = 0; i < rowsArray.length; i++) {
			for (let j = 0; j < columnsArray.length; j++) {
				//lets consider 2X3 multiple choice grid then option dom will be [{option:column1 dom:dom1} , {option:column2 dom:dom2} , {option:column3 dom:dom3} , {option:column1 dom:dom4} , {option:column2 dom:dom5} ,{option:column3 dom:dom6}]
				optionDom.push({ data: columnsArray[j], dom: optionsArray[i][j] });
			}
		}
		let row_col_dom = [];
		let q = 0;
		let arr = [];
		for (let i = 0; i < rowsArray.length; i++) {
			arr = [];
			for (let p = q; p < columnsArray.length * (i + 1); p++, q++) {
				arr.push(optionDom[p]);
			}
			row_col_dom.push({ row: rowsArray[i], cols: arr });
		}

		return {
			options: row_col_dom,
			rowArray: rowsArray,
			columnArray: columnsArray,
		};
	}

	//Extracting the options for field type = Checkbox Grid.
	getParamsCheckboxGrid(element) {
		// Input Type: DOM Object
		// Extracts the options of the question
		// Tweak : - The extraction is based on the DOM tree
		//         - The required node is founded by Brute-force traversing no attribute can be found to be helpful.
		//
		// Return Type : Returns an array of objects {row:rowsArray[i] , option_n_dom:arr} , arr is itself an array of objects containing columns and dom of (row,column)

		//No property can be found so need to traverse in this Brute force way only!
		const path =
			'div:first-child > div:first-child > div:nth-child(2) > div:first-child > div:nth-child(2) > div';

		//After getting to this path,
		//its first child contains a div which contains all columns.
		// and rest divs were for rows
		//But between each row there was an empty div so we need to extract 2nd,4th,6th.. i.e even numbered divs**
		const rows = element.querySelectorAll(`${path}:nth-child(2n)`);
		const columns = element.querySelectorAll(`${path}:first-child > div`);

		//In these columns if we think in term of matrix then (0,0) place is left vacant so we sliced form 1 and take out content of each column.
		const columnsArray = Array.from(columns)
			.slice(1)
			.map((column) => column.textContent.trim());
		const rowsArray = Array.from(rows).map((row) => row.textContent.trim());

		const optionArray = Array.from(
			element.querySelectorAll('div[role=group] label'),
		);

		const rowsLength = rowsArray.length;
		const columnsLength = columnsArray.length;

		const optionsArray = [];

		for (let i = 0; i < rowsLength; i++) {
			const rowArray = [];
			for (let j = 0; j < columnsLength; j++) {
				let index = i * columnsLength + j;
				rowArray.push(optionArray[index] || null);
			}
			optionsArray.push(rowArray);
		}

		let option_dom = [];
		for (let i = 0; i < rowsArray.length; i++) {
			for (let j = 0; j < columnsArray.length; j++) {
				option_dom.push({ option: columnsArray[j], dom: optionsArray[i][j] });
			}
		}
		let row_col_dom = [];
		let checkbox_number = 0;
		let arr = [];
		for (let row_index = 0; row_index < rowsArray.length; row_index++) {
			arr = [];
			for (
				let p = checkbox_number;
				p < columnsArray.length * (row_index + 1);
				p++, checkbox_number++
			) {
				arr.push(option_dom[p]);
			}
			row_col_dom.push({ row: rowsArray[row_index], cols: arr });
		}
		return {
			options: row_col_dom,
			rowArray: rowsArray,
			columnArray: columnsArray,
		};
	}

	//Extracting the options for field type = Dropdown.
	getParamsDropdown(element) {
		// Input Type: DOM Object
		// Extracts the options of the question
		// Tweak : - The extraction is based on the DOM tree
		//         - The required node is found by selecting all divs having role="option" , inside this there are spans which contain options.
		// Return Type : Array containing options.

		const optionDivs = element.querySelectorAll('div[role="option"]');
		if (!optionDivs || optionDivs.length === 0) {
			return { options: [] };
		}

		let options = [];
		//starting loop from one as option at 0th index is `Choose` so removed that.
		for (let i = 1; i < optionDivs.length; i++) {
			const optionDiv = optionDivs[i];
			const span = optionDiv.querySelector('span');

			if (span) {
				options.push({ data: span.textContent.trim(), dom: optionDiv });
			}
		}
		return { options: options };
	}

	getDomText(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="TEXT"
		// Return Type :Returns the input field.
		let inputField = element.querySelectorAll('input[type=text]');
		return { dom: inputField };
	}

	getDomTextEmail(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="TEXT_EMAIL"
		// Return Type :Returns the input field.

		let inputField = element.querySelectorAll(
			'input[type=text], input[type=email]',
		);
		return { dom: inputField };
	}
	getDomTextParagraph(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="PARAGRAPH"
		// Return Type :Returns the input field.

		let inputField = element.querySelectorAll('textarea');
		return { dom: inputField };
	}
	getDomDate(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="DATE"
		// Return Type :Returns an object { date: date_dom, month: month_dom, year: year_dom }
		let inputField = element.querySelectorAll(
			'input[type=text], input[type=date]',
		);
		let date_dom = null;
		let month_dom = null;
		let year_dom = null;
		//Input field is a nodelist seperating out day , month , and year from it.
		inputField.forEach((input) => {
			switch (input.getAttribute('aria-label')) {
				case 'Day of the month':
					date_dom = input;
					break;
				case 'Month':
					month_dom = input;
					break;
				case 'Year':
					year_dom = input;
					break;
				default:
					break;
			}
		});

		return { date: date_dom, month: month_dom, year: year_dom };
	}
	getDomDateAndTime(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="DATE_AND_TIME"
		// Return Type :Returns an object { date: date_dom, month: month_dom, year: year_dom, hour: hour_dom, minute: minute_dom }
		let inputField = element.querySelectorAll(
			'input[type=text], input[type=date]',
		);
		let date_dom = null;
		let month_dom = null;
		let year_dom = null;
		let hour_dom = null;
		let minute_dom = null;
		//Input field is a nodelist seperating out day , month , year , hour , and minute
		inputField.forEach((input) => {
			switch (input.getAttribute('aria-label')) {
				case 'Day of the month':
					date_dom = input;
					break;
				case 'Month':
					month_dom = input;
					break;
				case 'Year':
					year_dom = input;
					break;
				case 'Hour':
					hour_dom = input;
					break;
				case 'Minute':
					minute_dom = input;
					break;
				default:
					break;
			}
		});

		return {
			date: date_dom,
			month: month_dom,
			year: year_dom,
			hour: hour_dom,
			minute: minute_dom,
		};
	}

	getDomDuration(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="DURATION"
		// Return Type :Returns an object { hour: hour_dom, minute: minute_dom , second:second_dom}
		//Its 0th index give Hour_field , 1st index give Minute_field , 2nd index has Seconds field
		let inputField = element.querySelectorAll('input[type=text]');
		let hour_dom = null;
		let minute_dom = null;
		let second_dom = null;
		//Input field is a nodelist seperating out hour and minute dom
		inputField.forEach((input) => {
			switch (input.getAttribute('aria-label')) {
				case 'Hours':
					hour_dom = input;
					break;
				case 'Minutes':
					minute_dom = input;
					break;
				case 'Seconds':
					second_dom = input;
					break;
				default:
					break;
			}
		});

		return { hour: hour_dom, minute: minute_dom, second: second_dom };
	}
	getDomDateWithoutYear(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="DATE_WITHOUT_YEAR"
		// Return Type :Returns an object { date: date_dom, month: month_dom }
		// object will contain date_dom and month_dom
		let inputField = element.querySelectorAll(
			'input[type=text], input[type=date]',
		);
		let date_dom = null;
		let month_dom = null;
		//Input field is a nodelist seperating out day and month
		inputField.forEach((input) => {
			switch (input.getAttribute('aria-label')) {
				case 'Day of the month':
					date_dom = input;
					break;
				case 'Month':
					month_dom = input;
					break;
				default:
					break;
			}
		});

		return { date: date_dom, month: month_dom };
	}
	getDomDateTimeWithoutYear(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="DATE_WITHOUT_YEAR"
		// Return Type :Returns an object { date: date_dom, month: month_dom, hour: hour_dom, minute: minute_dom }
		let inputField = element.querySelectorAll(
			'input[type=text], input[type=date]',
		);
		let date_dom = null;
		let month_dom = null;
		let hour_dom = null;
		let minute_dom = null;
		//Input field is a nodelist seperating out day , month , and year from it.
		inputField.forEach((input) => {
			switch (input.getAttribute('aria-label')) {
				case 'Day of the month':
					date_dom = input;
					break;
				case 'Month':
					month_dom = input;
					break;
				case 'Hour':
					hour_dom = input;
					break;
				case 'Minute':
					minute_dom = input;
					break;
				default:
					break;
			}
		});

		return {
			date: date_dom,
			month: month_dom,
			hour: hour_dom,
			minute: minute_dom,
		};
	}
	getDomTextNumeric(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="TEXT_NUMERIC"
		// Return Type :Returns the input field.
		let inputField = element.querySelectorAll('input[type=text]');
		return { dom: inputField };
	}
	getDomTextTel(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="TEXT_TEL"
		// Return Type :Returns the input field.
		let inputField = element.querySelectorAll('input[type=text]');
		return { dom: inputField };
	}
	getDomTextUrl(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="TEXT_URL"
		// Return Type :Returns the input field.
		let inputField = element.querySelectorAll('input[type=url]');
		return { dom: inputField };
	}
	getDomDateTimeWithMeridiem(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="DATE_TIME_WITH_MERIDIEM"
		// Return Type :Returns an object { date: date_dom, month: month_dom, year: year_dom, hour: hour_dom, minute: minute_dom, meridiem: meridiem }
		//- meridiem nodelist - 0th index will contain dom of `AM` and 1st index will contain dom of `PM` option
		let meridiem = element.querySelectorAll('div[role=option]');
		let inputField = element.querySelectorAll(
			'input[type=text], input[type=date]',
		);
		let date_dom = null;
		let month_dom = null;
		let year_dom = null;
		let hour_dom = null;
		let minute_dom = null;
		//Input field is a nodelist seperating out day , month , and year from it.
		inputField.forEach((input) => {
			switch (input.getAttribute('aria-label')) {
				case 'Day of the month':
					date_dom = input;
					break;
				case 'Month':
					month_dom = input;
					break;
				case 'Year':
					year_dom = input;
					break;
				case 'Hour':
					hour_dom = input;
					break;
				case 'Minute':
					minute_dom = input;
					break;
				default:
					break;
			}
		});

		return {
			date: date_dom,
			month: month_dom,
			year: year_dom,
			hour: hour_dom,
			minute: minute_dom,
			meridiem: meridiem,
		};
	}
	getDomTimeWithMeridiem(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="TIME_WITH_MERIDIEM"
		// Return Type :Returns an object { hour: hour_dom, minute: minute_dom, meridiem: meridiem }
		//- meridiem nodelist - 0th index will contain dom of `AM` and 1st index will contain dom of `PM` option
		let meridiem = element.querySelectorAll('div[role=option]');
		let inputField = element.querySelectorAll(
			'input[type=text], input[type=date]',
		);
		let hour_dom = null;
		let minute_dom = null;
		//Input field is a nodelist seperating out day , month , and year from it.
		inputField.forEach((input) => {
			switch (input.getAttribute('aria-label')) {
				case 'Hour':
					hour_dom = input;
					break;
				case 'Minute':
					minute_dom = input;
					break;
				default:
					break;
			}
		});

		return { hour: hour_dom, minute: minute_dom, meridiem: meridiem };
	}
	getDomDateTimeWithMeridiemWithoutYear(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR"
		//- meridiem nodelist - 0th index will contain dom of `AM` and 1st index will contain dom of `PM` option
		// Return Type: Returns an object { date: date_dom, month: month_dom, hour: hour_dom, minute: minute_dom, meridiem: meridiem }
		let meridiem = element.querySelectorAll('div[role=option]');
		let inputField = element.querySelectorAll(
			'input[type=text], input[type=date]',
		);
		let date_dom = null;
		let month_dom = null;
		// let year_dom = null;
		let hour_dom = null;
		let minute_dom = null;
		//Input field is a nodelist seperating out day , month , year , hour , minute.
		inputField.forEach((input) => {
			switch (input.getAttribute('aria-label')) {
				case 'Day of the month':
					date_dom = input;
					break;
				case 'Month':
					month_dom = input;
					break;
				case 'Hour':
					hour_dom = input;
					break;
				case 'Minute':
					minute_dom = input;
					break;
				default:
					break;
			}
		});

		return {
			date: date_dom,
			month: month_dom,
			hour: hour_dom,
			minute: minute_dom,
			meridiem: meridiem,
		};
	}
	getDomTime(element) {
		// Input Type: DOM Object
		// Extracts the Dom object from Question type ="TIME"
		// Return Type :Returns an object { hour: hour_dom, minute: minute_dom}
		let inputField = element.querySelectorAll('input[type=text]');
		let hour_dom = null;
		let minute_dom = null;
		//Input field is a nodelist seperating out hour , minutes
		inputField.forEach((input) => {
			switch (input.getAttribute('aria-label')) {
				case 'Hour':
					hour_dom = input;
					break;
				case 'Minute':
					minute_dom = input;
					break;
				default:
					break;
			}
		});

		return { hour: hour_dom, minute: minute_dom };
	}
}
