import QType from "../../utils/question-types";

export class ParserEngine {
    constructor() { }

    parse(fieldType, value, response) {
        // Input Type : fieldType is a enum based on QType enum
        //              value is variable membered object,
        //              more information about it can be found in
        //              field-extractor engine docs 
        //              response is a string generated value as a response from prompt engine
        // This will parse and check validity of the prompt output upon arrival from prompt's response
        // from prompt-engine
        // Output Type : string containing the response if true or null if any expected inputs
        
        value = this.validateResponse(value);

        if (fieldType != null && value != null) {
            if (fieldType === QType.TEXT) {
                return this.parseText(response);
            }
            else if (fieldType === QType.TEXT_EMAIL) {
                return this.parseEmail(response);
            }
            else if (fieldType === QType.MULTIPLE_CHOICE) {
                return this.parseMultipleChoice(value, response);
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }

    parseText(response) {
        // TODO
        // Check If it's not multiline or not etc
        return response;
    }

    parseEmail(response) {
        // TODO
        // Check if it's a valid email or not
        return response;
    }

    parseMultipleChoice(value, response) {
        // TODO

        return response;
    }

    validateResponse(response) {
        // TODO

        // Check if it not one of those invalid CHATGPT or any other engine failed messages
        return response;
    }


}