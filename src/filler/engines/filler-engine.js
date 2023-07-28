import QType from '../../utils/question-types'

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export class FillerEngine {
  // Passes in the required field as form of input and fill in those values appropriately
  // via DOM

  constructor() { }

  fill(element, fieldType, fieldValue, value) {
    if (fieldType != null) {
      if (fieldType === QType.TEXT) {
        return this.fillText(fieldValue, "this is text")
      } else if (fieldType === QType.TEXT_EMAIL) {
        return this.fillEmail(fieldValue, 'harshit123@gmail.com')
      } else if (fieldType === QType.PARAGRAPH) {
        return this.fillParagraph(fieldValue, "this is a paragraph ")
      } else if (fieldType === QType.DATE) {
        return this.fillDate(fieldValue, "11-11-2111")
      } else if (fieldType === QType.DATE_AND_TIME) {
        return this.fillDateAndTime(fieldValue, '01-01-2003-01-01')
      } else if (fieldType === QType.TIME) {
        return this.fillTime(fieldValue, '02-02')
      } else if (
        fieldType === QType.MULTI_CORRECT_WITH_OTHER ||
        fieldType === QType.MULTI_CORRECT
      ) {
        return this.fillCheckBox(element, [
          'Sightseeing',
          'Day 2',
          { optionTitle: 'Other:', optionText: 'My name is Monark Jain' }
        ])
      } else if (fieldType === QType.DURATION) {
        return this.fillDuration(fieldValue, '11-11-11')
      } else if (fieldType === QType.DATE_WITHOUT_YEAR) {
        return this.fillDateWithoutYear(fieldValue, '11-11')
      } else if (fieldType === QType.DATE_TIME_WITHOUT_YEAR) {
        return this.fillDateTimeWithoutYear(fieldValue, '22-01-01-01')
      } else if (fieldType === QType.LINEAR_SCALE) {
        setTimeout(() => {
          return this.fillLinearScale(element, "2");
        }, 1000);
      } else if (fieldType === QType.DROPDOWN) {
        setTimeout(() => {
          return this.fillDropDown(element, "Option 1");
        }, 1000);
      }
      else {
        return false;
      }
    }
  }

  fillText(fieldValue, value) {
    // Input Type : Extracted Object(fieldValue) & string(value)
    // Valid value format :- Single line string
    // Function to fill question with type text input with a specified value.
    // Return Type : Boolean

    let inputField = fieldValue.dom[0]
    inputField.value = value
    let inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)
    return true
  }

  fillEmail(fieldValue, value) {
    // Input Type : Extracted Object(fieldValue) & string(value)
    // Valid value format :- An valid Email
    // Function to fill email
    // Return Type : Boolean

    let inputField = fieldValue.dom[0]
    inputField.value = value
    let inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)
    return true
  }

  fillParagraph(fieldValue, value) {
    // Input Type : Extracted Object(fieldValue) & string(value)
    // Valid value format :- A paragraph (can be multiline too)
    // Function to fill paragraph type questions
    // Return Type : Boolean

    let inputField = fieldValue.dom[0]
    inputField.value = value
    let inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)
    return true
  }

  fillDate(fieldValue, value) {
    // Input Type : Extracted Object(fieldValue) & string(value)
    // Valid Value format :- "dd-mm-yyyy"
    // Function to fill date
    // Return Type : Boolean

    // Validate the date format
    const datePattern = /^(\d{2})-(\d{2})-(\d{4})$/
    let inputEvent = new Event('input', { bubbles: true })

    if (!datePattern.test(value)) {
      // Invalid format
      return false
    }

    const [day, month, year] = value.split('-')
    const date = new Date(`${year}-${month}-${day}`)

    // Invalid date format as raised by date constructor
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#return_value
    if (date.valueOf() === NaN) {
      return false;
    }

    // To ensure any params to be filled isn't missed in Date constructor
    if (
      !(
        date.getDate() === Number(day) &&
        date.getMonth() + 1 === Number(month) && // Month numbering start from 0...11
        date.getFullYear() === Number(year)
      )
    ) {
      return false;
    }

    // 1. Fill the day input field
    let dd = fieldValue.date
    dd.value = day
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    dd.dispatchEvent(inputEvent)

    // 2. Fill the month input field
    let mm = fieldValue.month
    mm.value = month
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    mm.dispatchEvent(inputEvent)

    // 3. Fill the year input field
    let yyyy = fieldValue.year
    yyyy.value = year
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    yyyy.dispatchEvent(inputEvent)

    return true
  }

  async fillDateAndTime(fieldValue, value) {
    // Function to fill date and time
    // Input Type : Extracted Object(fieldValue) & string(value)
    // Tweak : 
    // Return Type : Boolean
    // Valid Value format :- "dd-mm-yyyy-hh-mm"
    // hh in 24 hrs format

    //sleep done because form was overriding values set by this function before
    await sleep(2000)

    let inputEvent = new Event('input', { bubbles: true })
    // Validate the date format
    const datePattern = /^(\d{2})-(\d{2})-(\d{4})-(\d{2})-(\d{2})$/
    if (!datePattern.test(value)) {
      // Invalid format
      return false
    }
    const [day, month, year, hours, minutes] = value.split('-')
    const date = new Date(`${year}-${month}-${day}`)

    // Invalid date format as raised by date constructor
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#return_value
    if (date.valueOf() === NaN) {
      return false;
    }

    // To ensure any params to be filled isn't missed in Date constructor
    if (
      !(
        date.getDate() === Number(day) &&
        date.getMonth() + 1 === Number(month) && // Month numbering start from 0...11
        date.getFullYear() === Number(year)
      )
    ) {
      return false
    }

    // 1. Fill the day input field
    let dd = fieldValue.date
    dd.value = day
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    dd.dispatchEvent(inputEvent)

    // 2. Fill the month input field
    let mm = fieldValue.month
    mm.value = month
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    mm.dispatchEvent(inputEvent)

    // 3. Fill the year input field
    let yyyy = fieldValue.year
    yyyy.value = year
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    yyyy.dispatchEvent(inputEvent)

    // TIME

    // hours
    let hh = fieldValue.hour
    hh.value = hours
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    hh.dispatchEvent(inputEvent)

    // minutes
    let min = fieldValue.minute
    min.value = minutes
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    min.dispatchEvent(inputEvent)

    return true
  }

  fillTime(fieldValue, value) {
    // Input Type : Extracted Object(fieldValue) & string(value)
    // Valid Value format :- "hh-mm"
    // Function to fill time
    // Return Type : Boolean
    // hh in 24 hrs format

    let inputEvent = new Event('input', { bubbles: true })
    const [hours, minutes] = value.split('-')

    // TIME

    // hours
    let hh = fieldValue.hour
    hh.value = hours
    // Dispatch the 'input' event on the input field to trigger any event listeners boundmin hh.dispatchEvent(inputEvent)
    hh.dispatchEvent(inputEvent)

    // minutes
    let min = fieldValue.minute
    min.value = minutes
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    min.dispatchEvent(inputEvent)

    return true
  }

  fillDuration(fieldValue, value) {
    // Input Type : Extracted Object(fieldValue) & string(value)
    // Valid Value format :- "hh-mm-ss"
    // Function to fill time
    // Return Type : Boolean
    // hh in 24 hrs format

    const [hours, minutes, seconds] = value.split('-')
    let inputEvent = new Event('input', { bubbles: true })

    // TIME

    // hours
    let hh = fieldValue.hour
    hh.value = hours
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    hh.dispatchEvent(inputEvent)

    // minutes
    let mm = fieldValue.minute
    mm.value = minutes
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    mm.dispatchEvent(inputEvent)

    // seconds
    let ss = fieldValue.second
    ss.value = seconds
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    ss.dispatchEvent(inputEvent)

    return true
  }

  fillDateWithoutYear(fieldValue, value) {
    // Input Type : Extracted Object(fieldValue) & string(value)
    // Valid Value format :- "dd-mm"
    // Function to fill date without year
    // Return Type : Boolean

    const [day, month] = value.split('-')
    let inputEvent = new Event('input', { bubbles: true })

    // 1. Fill the day input field
    let dd = fieldValue.date
    dd.value = day
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    dd.dispatchEvent(inputEvent)

    // 2. Fill the month input field
    let mm = fieldValue.month
    mm.value = month
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    mm.dispatchEvent(inputEvent)

    return true
  }

  async fillDateTimeWithoutYear(fieldValue, value) {
    // Input Type : Extracted Object(fieldValue) & string(value)
    // Valid Value format :- "dd-mm-hh-mm"
    // Function to fill date and time not having year
    // Return Type : Boolean
    // hh in 24 hrs format

    //! to avoid the race around between our answer and default NULL value
    await sleep(2000)

    let inputEvent = new Event('input', { bubbles: true })
    const [day, month, hours, minutes] = value.split('-')

    // 1. Fill the day input field
    let dd = fieldValue.date
    dd.value = day
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    dd.dispatchEvent(inputEvent)

    // 2. Fill the month input field
    let mm = fieldValue.month
    mm.value = month
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    mm.dispatchEvent(inputEvent)

    // TIME

    // hours
    let hh = fieldValue.hour
    hh.value = hours
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    hh.dispatchEvent(inputEvent)

    // minutes
    let min = fieldValue.minute
    min.value = minutes
    min.dispatchEvent(inputEvent)

    return true
  }

  async fillCheckBox(element, value) {
    //! To avoid any unwanted and incomplete answer this sleep function is necessary
    //! to avoid the race around between our answer and default NULL value
    await sleep(2000)

    // Function for interacting with 'MULTI_CORRECT_WITH_OTHER' type question.
    // Tick the checkbox with a matching 'value' string or object.
    // If ('value' is String ) => { Ticks the matching option if correct }
    // If ('value' is Object ) => { Ticks the Other option and enters the text in input box }

    // Uses 'input' event to trigger UI changes.
    // Returns true if checkbox is ticked, else false.

    let inputFields = element.querySelectorAll(
      'div[role=list] div[role=listitem]'
    )
    inputFields.forEach(element => {
      let option = element.querySelectorAll('div[role=checkbox]')
      let optionValue = option[0].getAttribute('aria-label')

      let otherOption = element.querySelectorAll(
        'div[data-other-checkbox=true]'
      )

      let otherOptionName = null;
      if (otherOption.length != 0) {
        otherOptionName = otherOption[0].getAttribute('aria-label')
      }

      value.forEach(val => {
        if (typeof val === 'string') {
          if (optionValue === val) {
            option[0].click()
            return true
          }
        } else if (
          typeof val === 'object' &&
          val.optionTitle === otherOptionName
        ) {
          let otherOptionTextBox = element.querySelectorAll('input')
          otherOptionTextBox[0].setAttribute('value', val.optionText)
          option[0].click()
          return true
        }
      })
    })

    return false
  }


  fillLinearScale(element, value) {

    // Function for interacting with 'LINEAR_SCALE' type question.
    // Tick the radio button with a matching 'value' .
    // Searched the value using "role" and "aria-label" attributes

    // Uses 'input' event to trigger UI changes.
    // Returns true if checkbox is ticked, else false.

    let inputFields = element.querySelectorAll(("div[role=radiogroup] span[role=presentation]"));
    inputFields = inputFields[0];

    let scales = inputFields.querySelectorAll("div[role=radio]");
    scales.forEach(scale => {
      if (scale.getAttribute("aria-label") === value) {
        var inputEvent = new Event('input', { bubbles: true });
        scale.click();
      }
    });

  }


  fillDropDown(element, value) {
    let optionElements = element.querySelectorAll("div[role=option]");

    optionElements.forEach(option => {
      console.log(option.getAttribute("data-value"));
      if (option.getAttribute("data-value") === value) {
        option.setAttribute("aria-selected", "true");
        option.setAttribute("tabindex", "0");
        option.click();
      } else {
        option.setAttribute("aria-selected", "false");
        option.setAttribute("tabindex", "-1");
      }
    });
    // setTimeout(() => {
    //   document.querySelector("body").click();
    // }, 1100);
  }

}
