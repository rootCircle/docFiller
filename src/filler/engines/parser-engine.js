import QType from "../../utils/question-types";

export class ParserEngine {
    constructor() { }



    parse(fieldType, value, response) {

        // It is hard-coded for testing purposes.
        response = {
            TEXT: "Amit",
            EMAIL: "abc@gmail.com",
            PARAGRAPH: "Please enjoy these great stories, fairy-tales, fables, and nursery rhymes for children.They help kids learn to read and make excellent bedtime stories! We have hundreds of great children's stories for you to share.",
            TEXT_NUMERIC: "1234",
            TEXT_TEL: "9111421028",
            MULTI_CORRECT: ["Hiking", "Exploring"],
            MULTI_CORRECT_WITH_OTHER: {
                options: ["Day 3", "Day 1"],
                other: "abcdefg"
            }
        }


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
                return this.parseText(response.TEXT);
            }
            else if (fieldType === QType.TEXT_EMAIL) {
                return this.parseEmail(response.EMAIL);
            }
            else if (fieldType === QType.MULTI_CORRECT_WITH_OTHER) {
                return this.parseMultipleCorrectWithOther(value, response.MULTI_CORRECT_WITH_OTHER);
            }
            else if (fieldType === QType.MULTI_CORRECT) {
                return this.parseMultiCorrect(value, response.MULTI_CORRECT);
            }
            else if (fieldType === QType.PARAGRAPH) {
                return this.parseParagraph(response.PARAGRAPH);
            }
            else if (fieldType === QType.TEXT_NUMERIC) {
                return this.parseTextNumberic(response.TEXT_NUMERIC);
            }
            else if (fieldType === QType.TEXT_TEL) {
                return this.parseText_Tel(response.TEXT_TEL);
            }
            else if (fieldType === QType.DATE) {
                return this.validateDate(response);
            }
            else if (fieldType === QType.DATE_AND_TIME) {
                return this.validateDateAndTime(response);
            }
            else if (fieldType === QType.TIME) {
                return this.validateTime(response);
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
        // Input Type : String [given by chatgpt]
        // Check if it's not text or not a/c:
        //          i) The response length is always greater than zero (0).
        //          ii) The number of lines is less than or equal to one (1).
        //          
        // Return Type : Boolean

        let text = response.trim();
        let noOfLines = 1;
        for (let i = 0; i < text.length; i++) {
            if (text[i] == '\n') {
                noOfLines++;
            }
        }

        if (text.length >= 1 && noOfLines <= 1) {
            return true;
        }
        return false;
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


    parseParagraph(response) {
        //  Input Type : String [given by chatgpt]
        // Check if it's not Paragraph or not a/c:
        //          i) The response length is always greater than zero (0).
        //          ii) The number of lines is greater than or equal to one (1).
        //          
        // Return Type : Boolean

        let Paragraph = response.trim();
        let noOfLines = 1;
        for (let i = 0; i < Paragraph.length; i++) {
            if (Paragraph[i] == '\n') {
                noOfLines++;
            }
        }

        if (Paragraph.length >= 1 && noOfLines >= 1) {
            return true;
        }
        return false;

    }

    parseTextNumberic(response) {

        // Input Type : String [given by chatgpt]
        // Check if it's a valid Text-Number or not a/c:
        //          i) given input matches with an numberRegex or not.
        //                
        // Return Type : Boolean

        let numberRegex = "^[0-9]*$"
        if (response.match(numberRegex)) {
            return true;
        }
        return false;
    }


    parseText_Tel(response) {

        // Input Type : String [given by chatgpt]
        // Check if it's a valid Phone-Number or not a/c:
        //          i) given input matches with an PhoneRegex or not.
        //                
        // Return Type : Boolean

        let PhoneRegex = "^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$"

        if (response.match(PhoneRegex)) {
            return true;
        }
        return false;
    }

    parseMultiCorrect(value, response) {
        //  Input Type : String [given by chatgpt] & value [DOM object]
        // Check if it's Multi-correct_response are match with DOM-options or not.
        // Return Type : Boolean

        let flag = false;
        let array = [];
        for (let i = 0; i < response.length; i++) {
            for (let j = 0; j < value.options.length; j++) {
                if (value.options[j].toUpperCase() === response[i].toUpperCase()) {
                    array.push("true");
                }
            }
        }
        if (array.length === response.length) {
            flag = true;
        }
        else {
            flag = false;
        }
        return flag;
    }


    parseMultipleCorrectWithOther(value, response) {

        //  Input Type : String [given by chatgpt] & value [DOM object]
        // Check if it's Multi-correct-withOther_response are match with value(DOM) a/c :
        //             i) Check if the given response options match the options in the DOM
        //             ii) If the response options do not match,check if the "response-other"
        //                 option matches any of the Text or Paragraph or not.
        // Return Type : Boolean

        let Optionsflag = false, otherflg = false;
        let array = [];
        for (let i = 0; i < response.options.length; i++) {
            for (let j = 0; j < value.options.length; j++) {
                if (value.options[j].toUpperCase() === response.options[i].toUpperCase()) {
                    array.push("true");
                }
            }
        }

        if (array.length === response.options.length) {
            Optionsflag = true;
        }
        else {
            Optionsflag = false;
        }
        otherflg = this.parseParagraph(response.other);
        if (Optionsflag === true) {
            return true;
        }
        else {
            if (otherflg === true) {
                return true;
            }
        }
        return false;
    }

    validateResponse(response) {
        // TODO

        // Check if it not one of those invalid CHATGPT or any other engine failed messages
        return response;
    }

}
