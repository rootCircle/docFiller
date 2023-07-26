export class DocExtractorEngine {
  constructor() {}

  checkSectionHeading(divNode) {
     // Input Type: DOM Object
    // Checks if the node is a typical google form section or not. name and heading node
    // Tweak : - If the first childnode of the selected div has role=heading then it is a suspected section heading
    // Return Type: Boolean

    // List the attributes
    const attributes = divNode.firstChild.attributes;

    // Might throw TypeError in case the node is a simple div with no attributes.getNamedItem() function, thus calling null() function will throw typeerror
    try {
      // If it turns out to be heading, then return true
      return attributes.getNamedItem("role").nodeValue === "heading";

    } catch (typeError) {
      // In case of typeError, we conclude it cant be heading thus return false
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
