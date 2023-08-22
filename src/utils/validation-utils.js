

class validationUtils {

    validateDate(date, month, year="2020") {
        // Input :- date(string), month(string), year(string)
        // Validates date is valid or not based on month and year
        // If no value for year is given, then code will assume the year to be a leap,
        // giving us more test ranger for date and month, and hence removes ambiguity
        // Output :- Boolean (truth justifies correctness of value)

        if (!(date && month)) {
            return false; // Invalid Input format
        }

        const dateRegex = /^([0][1-9]|[1-2][0-9]|[3][0-1])$/
        const monthRegex = /^([0][1-9]|[1][0-2])$/

        if (!(date.match(dateRegex) && month.match(monthRegex))) {
            return false; // Invalid values in Day or Month Params
        }

        year = Number(year);
        if (year === NaN) {
            return false; // Invalid formatted year
        }

        // Months containing 31 days
        const valid31 = ['01', '03', '05', '07', '08', '10', '12']

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

        return true;
    }
}

export default validationUtils