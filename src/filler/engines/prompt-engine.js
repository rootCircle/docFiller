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

    if (fieldType === QType.MULTIPLE_CHOICE) {
      return (
        "Please provide the correct option(just option and don’t write anything else) corresponding to the right answer for the following multiple-choice question:" +
        value.description +
        value.title
      );
    } else if (fieldType === QType.PARAGRAPH) {
      return (
        "Please provide a detailed response in the paragraph form for the following question: " +
        value.description +
        value.title
      );
    } else if (fieldType === QType.DATE_WITHOUT_YEAR) {
      return (
        "Please provide the date (month and day)-(in format MM/DD) -(only return MM/DD date , nothing else) that best corresponds to your response for the following question: " +
        +value.description +
        value.title
      );
    } else if (fieldType === QType.DATE_TIME_WITHOUT_YEAR){
        return (
            "Please strictly provide the date without year and time(in format MM/DD  Hr:Min ) -(only return MM/DD  Hr:Min date without year and time , nothing else and please don't give any prompt,just give the exact answer,include no string in answer)  that best corresponds to your response for the following question: "
            +value.description +
            value.title
        )
    }else if(fieldType === QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR){
        return (
            "Please strictly provide the date without year and time(in format MM/DD  Hr:Min (am or pm) ) -(only return MM/DD  Hr:Min date without year and time , nothing else and please don't give any prompt,just give the exact answer,include no string in answer)  that best corresponds to your response for the following question: "
            +value.description +
            value.title
        )
    }
    else if (fieldType === QType.DATE) {
      return (
        "Please provide the date(in format DD/MM/YYYY) -(only return DD/MM/YYYY date , nothing else,don't give any other sentence) that best corresponds to your response for the following question:" +
        value.description +
        value.title
      );
    } else if (fieldType === QType.DATE_TIME_WITH_MERIDIEM) {
      return (
        "Please strictly provide the date and time(in format DD/MM/YYYY  Hr:Min (am or pm)) -(only return DD/MM/YYYY  Hr:Min date and time , nothing else and please don't give any prompt,just give the exact answer,include no string in answer)  that best corresponds to your response for the following question: " +
        value.description +
        value.title
      );
    } else if (fieldType === QType.DATE_AND_TIME) {
        return (
          "Please strictly provide the date and time(in format DD/MM/YYYY  Hr:Min ) -(only return DD/MM/YYYY  Hr:Min date and time , nothing else and please don't give any prompt,just give the exact answer,include no string in answer)  that best corresponds to your response for the following question: " +
          value.description +
          value.title
        );
      } 
    else if (fieldType === QType.DURATION) {
      return (
        "Please provide the duration that best corresponds to your response(give only answer and nothing else in this format -Hrs:Min:Sec(answer without using parenthesis and just give the answer nothing else)) for the following question: " +
        value.description +
        value.title
      );
    }else {
      return null;
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
