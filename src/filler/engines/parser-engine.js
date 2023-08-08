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
                return this.validateEmail(response);
            }
            else if (fieldType === QType.MULTIPLE_CHOICE) {
                return this.parseMultipleChoice(value, response);
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
        // TODO
        // Check If it's not multiline or not etc
        return response;
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