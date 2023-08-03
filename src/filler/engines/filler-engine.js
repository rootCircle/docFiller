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
          return this.fillCheckBox(element, ["Day 1","Day 2",{optionTitle : "Other:" , optionText : "My name is Monark Jain"}]);
        }, 1000);
      }
      else if (fieldType === QType.LINEAR_SCALE) {
        setTimeout(() => {
          return this.fillLinearScale(element, "1");
        }, 1000);
      }
      else if (fieldType === QType.DROPDOWN) {
        setTimeout(() => {
          return this.fillDropDown(element, "Option 3");
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


  async fillCheckBox(element, value) {
    
    //! To avoid any unwanted and incomplete answer this sleep function is necessary 
    //! to avoid the race around between our answer and default NULL value
    await sleep(1000);

    // Function for interacting with 'MULTI_CORRECT_WITH_OTHER' type question.
    // Tick the checkbox with a matching 'value' string or object.
    // If ('value' is String ) => { Ticks the matching option if correct }
    // If ('value' is Object ) => { Ticks the Other option and enters the text in input box }
    
    // Uses 'input' event to trigger UI changes.
    // Returns true if checkbox is ticked, else false.
    
    
    let inputFields = element.querySelectorAll(("div[role=list] div[role=listitem]"));
    inputFields.forEach(element => {
      
      let option = element.querySelectorAll("div[role=checkbox]");
      let optionValue = option[0].getAttribute("aria-label");

      let otherOption = element.querySelectorAll("div[data-other-checkbox=true]");
      if (otherOption.length != 0) {
        var otherOptionName = otherOption[0].getAttribute("aria-label");
      }

      value.forEach(val => {

        if(typeof(val)==="string"){
          if(optionValue===val){
            option[0].click();
            return true;
          }
        }
        else if (typeof (val) === "object" && val.optionTitle===otherOptionName){
          let otherOptionTextBox = element.querySelectorAll("input");
          otherOptionTextBox[0].setAttribute("value",val.optionText);
          option[0].click();
          return true;
        }
        
      });
    });

    return false;
  }


  fillLinearScale(element, value){

    // Function for interacting with 'LINEAR_SCALE' type question.
    // Tick the radio button with a matching 'value' .
    // Searched the value using "role" and "aria-label" attributes
    
    // Uses 'input' event to trigger UI changes.
    // Returns true if checkbox is ticked, else false.

    let inputFields = element.querySelectorAll(("div[role=radiogroup] span[role=presentation]"));
    inputFields = inputFields[0];

    let scales = inputFields.querySelectorAll("div[role=radio]");
    scales.forEach(scale => {
      if(scale.getAttribute("aria-label")===value){
        var inputEvent = new Event('input', { bubbles: true });
        scale.click();
      }
    });

  }


  fillDropDown(element, value) {
  let optionElements = element.querySelectorAll("div[role=option]");

  optionElements.forEach(option => {
    console.log(option.getAttribute("data-value"));
    if (option.getAttribute("data-value") === value) {
      option.setAttribute("aria-selected", "true");
      option.setAttribute("tabindex", "0");
      option.click();
    } else {
      option.setAttribute("aria-selected", "false");
      option.setAttribute("tabindex", "-1");
    }
  });
  // setTimeout(() => {
  //   document.querySelector("body").click();
  // }, 1100);
} 

}

