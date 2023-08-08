import QType from "../../utils/question-types";
import { isValidPhoneNumber } from "libphonenumber-js";
import DEFAULT_TEL_COUNTRY from "../../utils/environment";

export class ParserEngine {
    constructor() { }



    parse(fieldType, extractedValue, response) {
        // Input Type : fieldType is a enum based on QType enum
        //              extractedValue is variable membered object,
        //              more information about it can be found in
        //              field-extractor engine docs 
        //              response is a string generated value as a response from prompt engine
        // This will parse and check validity of the prompt output upon arrival from prompt's response
        // from prompt-engine
        // Output Type : string containing the response if true or null if any expected inputs

        // It is hard-coded, only for testing purposes.
        let testResponse = {
            TEXT: "Amit",
            EMAIL: "abc@gmail.com",
            PARAGRAPH: "Please enjoy these great stories, fairy-tales, fables, and nursery rhymes for children.They help kids learn to read and make excellent bedtime stories! We have hundreds of great children's stories for you to share.",
            TEXT_NUMERIC: "1234",
            TEXT_TEL: "9111421028",
            MULTI_CORRECT: "Hiking\nExploring",
            MULTI_CORRECT_WITH_OTHER: "Day 1\nDay 2",
            DATE: "22-12-2022",
            TIME: "10-12",
            DATE_AND_TIME: "22-12-2022-12-12"
        }



        response = this.validateResponse(response);


        if (fieldType != null && extractedValue != null) {
            switch (fieldType) {
                case QType.TEXT:
                    return this.validateText(testResponse.TEXT);
                case QType.TEXT_EMAIL:
                    return this.validateEmail(testResponse.EMAIL);
                case QType.MULTI_CORRECT_WITH_OTHER:
                    return this.validateMultipleCorrectWithOther(extractedValue, testResponse.MULTI_CORRECT_WITH_OTHER);
                case QType.MULTI_CORRECT:
                    return this.validateMultiCorrect(extractedValue, testResponse.MULTI_CORRECT);
                case QType.PARAGRAPH:
                    return this.validateParagraph(testResponse.PARAGRAPH);
                case QType.TEXT_NUMERIC:
                    return this.validateTextNumeric(testResponse.TEXT_NUMERIC);
                case QType.TEXT_TEL:
                    return this.validateTextTel(testResponse.TEXT_TEL);
                case QType.DATE:
                    return this.validateDate(testResponse.DATE);
                case QType.DATE_AND_TIME:
                    return this.validateDateAndTime(testResponse.DATE_AND_TIME);
                case QType.TIME:
                    return this.validateTime(testResponse.TIME);
                default:
                    return null;
            }            
        }
        else {
            return null;
        }
    }

    validateText(response) {
        // Input Type : String [given by chatgpt]
        // Check if it's not text or not a/c:
        //          i) The response length is always greater than zero (0).
        //          ii) The number of lines is equal to one (1).
        //          
        // Return Type : Boolean

        let text = response.trim();

        return text.length > 0 && !text.includes('\n', '\r');
    }

    validateParagraph(response) {
        // Input Type : String [given by chatgpt]
        // Check if it's not Paragraph or not, a/c to:
        //          i) The response length is always greater than zero (0).
        //          ii) The number of lines is greater than or equal to one (1).
        //          
        // Return Type : Boolean

        return response.trim().length > 0;

    }

    validateTextNumeric(response) {
        // Input Type : String [given by chatgpt]
        // Valid Input Format :- Numeric Values only
        // Check if it's a valid Text Numeric or not, a/c to:
        //          i) given input matches with an numberRegex or not.
        //                
        // Return Type : Boolean

        return Number(response.trim()).valueOf() !== NaN;
    }

    validateTextTel(response) {
        // Input Type : String [given by chatgpt]
        // Check if it's a valid Phone-Number or not, a/c to:
        //          i) given input matches with an PhoneRegex or not.
        //                
        // Return Type : Boolean

        // let PhoneRegex = "^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$"
        // Alternatively can use regex, if package size becomes an constraint
        return isValidPhoneNumber(response, DEFAULT_TEL_COUNTRY);
    }

    validateEmail(response) {
        // Input Type : String
        // Check if it's a valid email or not
        // Checking valid email in accord to RFC 5322
        // https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression/201378#201378
        // Return Type : Boolean

        let mailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        return response && Boolean(response.match(mailRegex));
    }

    validateDate(response) {
        // Input :- String
        // Valid Input Format :- DD-MM--YYYY
        // Checks if date is in correct format or not
        // Output :- Boolean
        var dateValid = /^([0][1-9]|[1-2][0-9]|[3][0-1])-([0][1-9]|[1][0-2])-(\d{4})$/
        const dateArr = response === null ? false : response.match(dateValid)
        if (dateArr) {

            // Months containing 31 days
            const valid31 = ['01', '03', '05', '07', '08', '10', '12']
            const date = dateArr[1]
            const month = dateArr[2]
            const year = Number(dateArr[3])


            if (date == '31') {
                if (!valid31.includes(month))
                    return false;
            }
            else if (date == '30') {
                if (month == '02') {
                    return false; // February doesn't have 30 days
                }
            }
            else if (date == '29') {
                if (month == '02') {
                    if (year % 4 != 0 || (year % 100 == 0 && year % 400 != 0))
                        return false; // Non-leap year doesn't have 29 days
                }
            }
            return true
        }
        else {
            return false
        }
    }

    validateDateAndTime(response) {
        // Input Type :- String
        // Valid Input Format :- DD-MM-YYYY-HH-MM
        // HH is in 24 hrs format
        // Checks if date & time is in correct format
        // Output Type :- Boolean

        var dateTimeValid = /^([0][1-9]|[1-2][0-9]|[3][0-1])-([0][1-9]|[1][0-2])-(\d{4})-([01][0-9]|[2][0-3])-([0-5][0-9])$/
        const dateArr = response === null ? false : response.match(dateTimeValid)
        if (dateArr) {

            // Months containing 31 days
            const valid31 = ['01', '03', '05', '07', '08', '10', '12']
            const date = dateArr[1]
            const month = dateArr[2]
            const year = Number(dateArr[3])


            if (date == '31') {
                if (!valid31.includes(month))
                    return false;
            }
            else if (date == '30') {
                if (month == '02') {
                    return false; // February doesn't have 30 days
                }
            }
            else if (date == '29') {
                if (month == '02') {
                    if (year % 4 != 0 || (year % 100 == 0 && year % 400 != 0))
                        return false; // Non-leap year doesn't have 29 days
                }
            }
            return true
        }
        else
            return false
    }

    validateTime(response) {
        // Input Type :- String
        // Valid Input Format :- HH-MM
        // HH is in 24 hrs format
        // Checks if time is in correct format
        // Output Type :- Boolean

        var timeValid = /^([01][0-9]|[2][0-3])-([0-5][0-9])$/
        return response && Boolean(response.match(timeValid));
    }



    validateMultiCorrect(extractedValue, response) {
        // Input Type : String [given by chatgpt] & extractedValue [DOM object]
        // Valid Input Format :- Multi Lined Options, with each new option separated by a newline
        // Check if it's Multi-correct's response are matches with actual options or not.
        // Return Type : Boolean

        let flag = true; // Assuming response for Prompt engine is correct by default
        let responseOptions = response.split(/\r?\n/);

        let actualOptions = [];
        extractedValue.options.forEach((option) => { actualOptions.push(option.data) });

        for (let i = 0; i < responseOptions.length; i++) {
            if (actualOptions.findIndex((option) => 
                    responseOptions[i].toLowerCase() === option.toLowerCase()) === -1) {
                        flag = false;
            }
        }

        console.log(actualOptions)
        console.log(responseOptions)
        console.log(flag)

        return flag;
    }


    validateMultipleCorrectWithOther(extractedValue, response) {
        // Input Type : String [given by chatgpt] & extractedValue [DOM object]
        // Valid Input Format :- Multi Lined Options, with each new option separated by a newline, 
        //                       in case of non-matching options, response should be like `Other <Text>` format
        // Check if it's Multi-correct withOther's response are match with extractedValue(DOM) a/c to :
        //             i) Check if the given response options match the options in the DOM
        //             ii) If the response options do not match,check if the "response-other"
        //                 option matches any of the Text or not.
        //             iii) We assume other option flag is invoked when all other option is incorrect
        // Return Type : Boolean

        return this.validateMultiCorrect(extractedValue, response) || ( response.startsWith("Other") && this.validateText(response));
    }

    validateResponse(response) {
        // TODO

        // Check if it not one of those invalid CHATGPT or any other engine failed messages
        return response;
    }

}
