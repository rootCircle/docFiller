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
            else if (fieldType === QType.DATE) {
                return this.parseDate(response);
            }
            else if (fieldType === QType.DATE_AND_TIME) {
                return this.parseDateAndTime(response);
            }
            else if (fieldType === QType.TIME) {
                return this.parseTime(response);
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
        var mailValid = /^\w+([\.-]?\w+)*@\w+(\.\w{2,3})+$/;
        if(response.match(mailValid))
        return true;
        return false;
    }

    parseDate(response) {
        //Checks If date is in correct format
        var dateValid = /^([0][1-9]|[1-2][0-9]|[3][0-1])-([0][1-9]|[1][0-2])-(\d{4})$/
        const dateArr = response.match(dateValid)
        if(dateArr)
        {
            const valid31 = ['01','03','05','07','08','10','12']
            const date = dateArr[1]
            const month = dateArr[2]
            const year = Number(dateArr[3])
            if(date=='31')
            {
                if(!valid31.includes(month))
                return false;
            }
            else if(date=='30')
            {
                if(month=='02')
                return false;
            }
            else if(date=='29')
            {
                if(month=='02')
                {
                    if(year%4!=0||(year%100==0&&year%400!=0))
                    return false;
                }
            }
            return true
        }
        else
            return false
    }

    parseDateAndTime(response) {
        //Checks If date time is in correct format
        var dateTimeValid = /^([0][1-9]|[1-2][0-9]|[3][0-1])-([0][1-9]|[1][0-2])-(\d{4})-([01][0-9]|[2][0-3])-([0-5][0-9])$/
        const dateArr = response.match(dateTimeValid)
        if(dateArr)
        {
            const valid31 = ['01','03','05','07','08','10','12']
            const date = dateArr[1]
            const month = dateArr[2]
            const year = Number(dateArr[3])
            if(date=='31')
            {
                if(!valid31.includes(month))
                return false;
            }
            else if(date=='30')
            {
                if(month=='02')
                return false;
            }
            else if(date=='29')
            {
                if(month=='02')
                {
                    if(year%4!=0||(year%100==0&&year%400!=0))
                    return false;
                }
            }
            return true
        }
        else
            return false
    }

    parseTime(response) {
        var timeValid = /^([01][0-9]|[2][0-3])-([0-5][0-9])$/
        if(response.match(timeValid))
        return true;
        else
        return false;
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