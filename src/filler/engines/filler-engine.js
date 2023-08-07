import QType from "../../utils/question-types";

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export class FillerEngine {
  // Passes in the required field as form of input and fill in those values appropriately
  // via DOM

  constructor() { }

  fill(element, fieldType, fieldValue, value) {
    if (fieldType != null) {
      if (fieldType === QType.TEXT) {
        return this.fillText(element, value);
      }
      else if (fieldType === QType.TEXT_EMAIL) {
        return this.fillEmail(element, value);
      }
      else if (fieldType === QType.MULTI_CORRECT_WITH_OTHER) {
        setTimeout(() => {
          return this.fillCheckBox(element,fieldValue, ["Day 1", "Day 2", { optionTitle: "Other:", optionText: "My name is Monark Jain" }]);
        }, 1000);
      }
      else if (fieldType === QType.LINEAR_SCALE) {
        setTimeout(() => {
          return this.fillLinearScale(element, "1");
        }, 1000);
      }
      else if (fieldType === QType.DROPDOWN) {
        setTimeout(() => {
          return this.fillDropDown(element, "Option 2");
        }, 1000);
      }
      else if (fieldType === QType.CHECKBOX_GRID) {
        setTimeout(() => {
          return this.fillCheckboxGrid(element,fieldValue, [{ row: "Row 1", Optionvalues: ["Column 1", "Column 3"] }, { row: "Row 2", Optionvalues: ["Column 2"] }]);
        }, 1000);
      }
      else if (fieldType === QType.MULTIPLE_CHOICE_GRID) {
        setTimeout(() => {
          return this.fillMultipleChoiceGrid(element, [{ row: "Row 1", Optionvalue: "Column 1" }, { row: "Row 2", Optionvalue: "Column 2" }, { row: "Brooooo", Optionvalue: "Column 2" }]);
        }, 1000);
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  fillText(element, value) {
    // return true if value is successfully written, else false
    return true;
  }

  fillEmail(element, value) {
    // return true if value is successfully written, else false
    return true;
  }


  async fillCheckBox(element,fieldValue, value) {

    //! To avoid any unwanted and incomplete answer this sleep function is necessary 
    //! to avoid the race around between our answer and default NULL value
    await sleep(1000);

    // Function for interacting with 'MULTI_CORRECT_WITH_OTHER' type question.
    // Tick the checkbox with a matching 'value' string or object.
    // If ('value' is String ) => { Ticks the matching option if correct }
    // If ('value' is Object ) => { Ticks the Other option and enters the text in input box }

    // Uses 'input' event to trigger UI changes.
    // Returns true if checkbox is ticked, else false.

    fieldValue.options.forEach(element => {

      value.forEach(val => {

        if (typeof (val) === "string") {
          if (element.data === val) {
            element.dom.click();
            return true;
          }
        }
        else if (typeof (val) === "object" && val.optionTitle === fieldValue.other[0].data) {
          fieldValue.other[0].dom.click();
          fieldValue.other[0].inputBoxDom.setAttribute("value", val.optionText);
          return true;
        }
      });
    });

    return false;
  }


  fillLinearScale(element, value) {

    // Function for interacting with 'LINEAR_SCALE' type question.
    // Tick the radio button with a matching 'value' .
    // Searched the value using "role" and "aria-label" attributes

    // Uses 'input' event to trigger UI changes.
    // Returns true if checkbox is ticked, else false.

    let inputFields = element.querySelectorAll(("div[role=radiogroup] span[role=presentation]"));
    inputFields = inputFields[0];

    let scales = inputFields.querySelectorAll("div[role=radio]");
    scales.forEach(scale => {
      if (scale.getAttribute("aria-label") === value) {
        var inputEvent = new Event('input', { bubbles: true });
        scale.click();
        return true;
      }
    });

  }


  fillDropDown(element, value) {
    // Input Type : DOM object { Drop-Down List }
    // Checks if given gpt response matches any Dropdown option or not
    // Tweak : A dropdown has many div(s) which have role = option in it
    //         if for each such div, the value matches the option is selected
    // Return Type : Boolean

    let optionElements = element.querySelectorAll("div[role=option]");
    console.log(optionElements)
    optionElements.forEach(option => {
      if (option.getAttribute("data-value") === value) {
        option.setAttribute("aria-selected", "true");
        option.setAttribute("tabindex", "0");
        option.click();
        return true;
      } else {
        option.setAttribute("aria-selected", "false");
        option.setAttribute("tabindex", "-1");
      }
    });

    return false;
  }




  fillCheckboxGrid(element,fieldValue, value){
    // Input Type : DOM object { Multicorrect Checkbox Grid }
    // Checks if given gpt response matches any option or not
    // Tweak : A grid has many div(s) which have role = group in it
    //         if for each such div, the value matches the option is selected
    console.log(fieldValue)
    fieldValue.options.forEach(rowItr => {
      
      value.forEach(object => {

        if(object.row===rowItr.row){
          rowItr.cols.forEach(colItr => {
            var inputEvent = new Event('input', { bubbles: true })
            // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
            
            object.Optionvalues.forEach(val => {
              if(colItr.option===val){
                colItr.dom.parentElement.dispatchEvent(inputEvent)
                console.log(colItr.dom.parentNode)
                // colItr.dom.parentNode.click();
              }
            });
          });

        }
      });
    });
  }




  fillMultipleChoiceGrid(element,value){
    // Input Type : DOM object { Multiple Choice List }
    // Checks if given gpt response matches any option or not
    // Tweak : A grid has many span(s) which have role = presentation in it
    //         if for each such span, the value matches the option is selected

    let rows = element.querySelectorAll("div[role=radiogroup] span[role=presentation]");
    rows.forEach(row => {
      let rowName = row.querySelector("div").innerHTML;
      value.forEach(object => {
        if(object.row===rowName){
          let columnOptions = row.querySelectorAll("div[role=radio]");
          columnOptions.forEach(columnCheckbox => {
            let columnValue = columnCheckbox.getAttribute("data-value");
              if(columnValue===object.Optionvalue){
                columnCheckbox.click();
              }
          });

        }
      });
    });
  }

}

