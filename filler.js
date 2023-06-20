class docExtractorEngine {

  docExtractorEngine() {
    this.questionTypes = {
      singleLine: "SingleLine",
      multiLine: "MultiLine",
      mcq: "MCQ",
      mmcq: "MMCQ", // More than 1 correct

    }
  }

  getValidQuestions() {
    let questions = this.getQuestions();
    questions = this.validateQuestions(questions);
    console.log(questions);
  }

  getQuestions() {
    return document.querySelectorAll("div[role=listitem]");
  }

  validateQuestions(questions) {
    return Array.prototype.slice.call(questions).filter(question => {
      return !this.isCheckBoxListItem(question)
    });
  }

  isCheckBoxListItem(element) {
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

  detectType(element) {

  }
}






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


console.log(new docExtractorEngine().getValidQuestions());





class Data {
  constructor(pageNo, sectionID, data, questionStatement, assumedImageContext, outputType, value) {
    this.pageNo = pageNo;
    this.sectionID = sectionID;
    this.data = data;
    this.questionStatement = questionStatement;
    this.assumedImageContext = assumedImageContext;
    this.outputType = outputType;
    this.value = value;
  }
}

