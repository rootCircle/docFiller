import QType from "../../utils/question-types";
import GPTEngine from "../../utils/gpt-engines";

export class PromptEngine {
    constructor(engine) {
        // Input Type : String based on GPTEngine enum
        // Specifying the type of GPT engine to query response
        if (engine) {
            this.engine = engine;
        }
        else {
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
            }
            else if (this.engine === GPTEngine.BARD) {
                return this.askBard(promptText);
            }
        }
        else {
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
            case QType.LINEAR_SCALE:
                //tested on ChatGPT and Bing AI
                return `On a scale from 1 to ${value.options.length} \n ${value.title} \n ${value.description} \n Return only the integer answer and nothing else(give any random answer on better side if it depends from person to person but only return required integer answer no extra text) \n key 1 represent "${value.bounds.lowerBound}" and key ${value.options.length} represent "${value.bounds.upperBound}" with uniform distribution between.\n Only return the key corresponding to calculated answer`;
            
            case QType.MULTI_CORRECT:
                 //tested on ChatGPT and Bing AI
                return `More than one option may be correct for this question \nYour task is to check all options that are correct and return their exact sentences \nProvide the correct sentences only, without any extra text or messages \nQuestion: \n\n ${value.title} \n ${value.description} \nOptions: \n${value.options.map(option => option.option_data).join('\n')}`;
                
            case QType.MULTI_CORRECT_WITH_OTHER:
                 //tested on ChatGPT and Bing AI
                return `More than one option may be correct for this question \nYour task is to check all options that are correct and return their exact sentences \nProvide the correct sentences only, without any extra text or messages \nIf your option is the last option 'Other:', then write 'Other:' on the first line and provide your 1-line answer for the question \nQuestion: \n\n ${value.title} \n ${value.description} \n Options: \n${[...value.options.map(option => option.data), value.other[0].data].join('\n')}`;
            

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