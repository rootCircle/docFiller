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

  // will return true if the node is a typical google form section name and heading node
  checkSectionHeading(divNode) {
    // returns if the div selected by div[role=listitem] is a heading or not
    // logic : if the first childnode of the selected div has role=heading then it is a section heading
    const attributes = divNode.firstChild.attributes;

    try {
      if (attributes.getNamedItem === null) return false;
      else if (attributes.getNamedItem("role").nodeValue === "heading") {
        return true;
      }
      return false;
    } catch (typeError) {
      // console.log(typeError);
      return false;
    }
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

    // ---------- validate if section heading or not ---------
    // clears the node from questions array if role=listitem includes the section heading (the purple colored one)
    questions = Array.from(
      document.querySelectorAll("div[role=listitem]")
    ).filter((question) => !this.checkSectionHeading(question));
    // -------------------------------------------------------

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
