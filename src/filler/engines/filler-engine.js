import QType from "../../utils/question-types";

export class FillerEngine {
  // Passes in the required field as form of input and fill in those values appropriately
  // via DOM

  constructor() { }

  fill(element, fieldType, value) {
    if (fieldType != null) {
      if (fieldType === QType.TEXT) {
        return this.fillText(element, value);
      }
      else if (fieldType === QType.TEXT_EMAIL) {
        return this.fillEmail(element, value);
      }
      else if (fieldType === QType.PARAGRAPH) {
        return this.fillParagraph(element, value);
      }
      else if (fieldType === QType.DATE) {
        return this.fillDate(element, value);
      }
      else if (fieldType === QType.DATE_AND_TIME) {
        return this.fillDate_And_Time(element, value);
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
    var inputField = element.querySelectorAll('input[type=text]');
      inputField=inputField[0];
      inputField.value = value;
      var inputEvent = new Event('input', { bubbles: true });
      inputField.dispatchEvent(inputEvent)
      return true;
}

fillEmail(element, value) {
  // return true if value is successfully written, else false
  var inputField = element.querySelectorAll('input[type=text], input[type=email]');
  inputField=inputField[0];
  inputField.value = value;
  var inputEvent = new Event('input', { bubbles: true });
  inputField.dispatchEvent(inputEvent)
  return true;
}

fillParagraph(element, value) {
  // return true if value is successfully written, else false
  var inputField = element.querySelectorAll('textarea');
    inputField=inputField[0];
    inputField.value = value;
    var inputEvent = new Event('input', { bubbles: true });
    inputField.dispatchEvent(inputEvent)
    return true;
}

fillDate(element, value) {

  // Validate the date format
  const datePattern = /^(\d{2})-(\d{2})-(\d{4})$/;

  if (!datePattern.test(value)) {
    // Invalid format
    return false; 
  }

  const [day, month, year] = value.split("-");
  const date = new Date(`${year}-${month}-${day}`);

  if (!(date.getDate() === Number(day) && date.getMonth() + 1 === Number(month) && date.getFullYear() === Number(year))) {
    console.log("Invalid date format or an invalid date.");
    return false;
  }


  // 1. Fill the day input field
  var inputField = element.querySelectorAll('input[type=text], input[type=date]');
  inputField = inputField[0];
  inputField.value = day;
  var inputEvent = new Event('input', { bubbles: true });
  inputField.dispatchEvent(inputEvent);

  // 2. Fill the month input field
  inputField = element.querySelectorAll('input[type=text], input[type=date]');
  inputField = inputField[1];
  inputField.value = month;
  inputEvent = new Event('input', { bubbles: true });
  inputField.dispatchEvent(inputEvent);

  // 3. Fill the year input field
  inputField = element.querySelectorAll('input[type=text], input[type=date]');
  inputField = inputField[2];
  inputField.value = year;
  inputEvent = new Event('input', { bubbles: true });
  inputField.dispatchEvent(inputEvent);

  return true;
}



}
