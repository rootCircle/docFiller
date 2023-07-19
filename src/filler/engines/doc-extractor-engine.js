export class DocExtractorEngine {
  constructor() {
    // Generating enums to help getting valid types
    this.questionTypes = {
      singleLine: "SingleLine",
      multiLine: "MultiLine",
      mcq: "MCQ",
      mmcq: "MMCQ", // More than 1 correct
    };
  }

  getValidQuestions() {
    // Returns an Array of DOM objects of validated Boxes present in Google Form
    // Return Type : Array
    let questions = this.getQuestions();
    questions = this.validateQuestions(questions);
    return questions;
  }

  getQuestions() {
    // Returns all the Boxes in Google Docs
    // But, as a garbage returns checkbox too
    // Returns a node list array, where each element is a DOM containing complete information for questions
    // Return Type : NodeList
    return document.querySelectorAll("div[role=listitem]");
  }

  validateQuestions(questions) {
    // Input Type : NodeList
    // Weeds out Checkbox collected as a false positive in getQuestions method
    // and returns only the correct ones
    // Return Type : Array
    return Array.prototype.slice.call(questions).filter((question) => {
      return !this.isCheckBoxListItem(question);
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
      if (parent.getAttribute("role") === "listitem") {
        hasListRole = true;
      }
      parent = parent.parentElement;
    }
    return hasListRole;
  }
}
