import QType from "../../utils/question-types";
import GPTEngine from "../../utils/gpt-engines";

export class PromptEngine {
  constructor(engine) {
    // Input Type : String based on GPTEngine enum
    // Specifying the type of GPT engine to query response
    if (engine) {
      this.engine = engine;
    } else {
      // Specifying the default GPT engine as CHATGPT engine in case of no inputs
      this.engine = GPTEngine.CHATGPT;
    }
  }

  getResponse(fieldType, value) {
    // Input Type : fieldType is a enum based on QType enum
    //              value is variable membered object,
    //              more information about it can be found in
    //              field-extractor engine docs
    // Get the personalized prompt based on type of question and value
    // Output Type : string containing the response or null if any error arose
    let promptText = this.prompt(fieldType, value);

    if (promptText !== null) {
      // Calling respective engine based on value
      if (this.engine === GPTEngine.CHATGPT) {
        return this.askChatGPT(promptText);
      } else if (this.engine === GPTEngine.BARD) {
        return this.askBard(promptText);
      }
    } else {
      return null;
    }
  }

  prompt(fieldType, value) {
    // Input Type : fieldType is a enum based on QType enum
    //              value is variable membered object,
    //              more information about it can be found in
    //              field-extractor engine docs
    // Return personalized prompt for respective fieldType
    // Output Type : string containing type, or null if invalid fieldType

    switch (fieldType) {
      case QType.MULTIPLE_CHOICE:
        return (
          "Please provide the correct option(just option and don't write anything else) corresponding to the right answer for the following multiple-choice question:" +
            (value.description !== null ? value.description : "") + " " +
          value.title + "\n" + 
          value.options.map(option => option.data).join('\n')
        );

      case QType.PARAGRAPH:
        return (
          "Please provide a detailed response in the paragraph form for the following question: " +
            (value.description !== null ? value.description : "") + " " +
          value.title
        );

      case QType.DATE_WITHOUT_YEAR:
        return (
          "Please provide the date (month and day)-(in format DD-MM) -(only return DD-MM date , nothing else) that best corresponds to your response for the following question: " +
            (value.description !== null ? value.description : "") + " " +
          value.title
        );

      case QType.DATE_TIME_WITHOUT_YEAR:
        return (
          "Please strictly provide the date without year and time(in format DD-MM-HH-Min ) -(only return DD-MM-HH-Min date without year and time, nothing else and please don't give any prompt,just give the exact answer,include no string in answer)  that best corresponds to your response for the following question: " +
            (value.description !== null ? value.description : "") + " " +
          value.title
        );

      case QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR:
        return (
          "Please strictly provide the date without year and time(in format DD-MM-HH-Min (am or pm) ) -(only return DD-MM-HH-Min date without year and time , nothing else and please don't give any prompt,just give the exact answer,include no string in answer)  that best corresponds to your response for the following question: " +
            (value.description !== null ? value.description : "") + " " +
          value.title
        );

      case QType.LINEAR_SCALE:
        return `On a scale from 1 to ${value.options.length} \n ${value.title} \n ${value.description !== null ? value.description : ""} \n Return only the integer answer and nothing else(give any random answer on better side if it depends from person to person but only return required integer answer no extra text) \n key 1 represent "${value.bounds.lowerBound}" and key ${value.options.length} represent "${value.bounds.upperBound}" with uniform distribution between.\n Only return the key corresponding to calculated answer`;

      case QType.MULTI_CORRECT:
        return `More than one option may be correct for this question \nYour task is to check all options that are correct and return their exact sentences \nQuestion: \n\n ${value.title} \n ${value.description !== null ? value.description : "" } \nOptions: \n${value.options.map(option => option.data).join('\n')}`;

      case QType.MULTI_CORRECT_WITH_OTHER:
        return `More than one option may be correct for this question \nYour task is to check all options that are correct and return their exact sentences \nIf your option is the last option 'Other:', then write 'Other:' on the first line and provide your 1-line answer for the question \nQuestion: \n\n ${value.title} \n ${value.description !== null ? value.description : ""} \n Options: \n${[...value.options.map(option => option.data), value.other[0].data].join('\n')}`;

      case QType.DATE:
        return (
          "Please provide the date(in format DD-MM-YYYY) -(only return DD-MM-YYYY date , nothing else,don't give any other sentence) that best corresponds to your response for the following question:" +
            (value.description !== null ? value.description : "") + " " +
          value.title
        );

      case QType.DATE_TIME_WITH_MERIDIEM:
        return (
          "Please strictly provide the date and time(in format DD-MM-YYYY-HH-mm (am or pm)) -(only return DD-MM-YYYY-HH-mm date and time , nothing else and please don't give any prompt,just give the exact answer,include no string in answer)  that best corresponds to your response for the following question: " +
            (value.description !== null ? value.description : "") + " " +
          value.title
        );

      case QType.DATE_AND_TIME:
        return (
          "Please strictly provide the date and time(in format DD-MM-YYYY-HH-mm ) -(only return DD-MM-YYYY-HH-mm date and time , nothing else and please don't give any prompt,just give the exact answer,include no string in answer)  that best corresponds to your response for the following question: " +
            (value.description !== null ? value.description : "") + " " +
          value.title
        );

      case QType.DURATION:
        return (
          "Please provide the duration that best corresponds to your response(give only answer and nothing else in this format HH-mm-SS (answer without using parenthesis and just give the answer nothing else)) for the following question: " +
            (value.description !== null ? value.description : "") + " " +
          value.title
        );

      default:
        return "Invalid field type";
    }

  }

  askChatGPT(prompt) {
    // Input Type : prompt:string containing the string
    // Output Type : string containing the output, null if any error
    // TODO
    // Call chatgpt using API, don't push API keys in code
    return "Response of Prompt from ChatGPT Engine";
  }

  askBard(prompt) {
    // Input Type : prompt:string containing the string
    // Output Type : string containing the output, null if any error
    // TODO
    // Call Bard using API calls, don't push API keys in code
    return "Response of Prompt from Bard based on prompt";
  }
}
