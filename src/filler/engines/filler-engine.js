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

}
