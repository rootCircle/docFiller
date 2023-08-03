import QType from '../../utils/question-types'

function sleep (milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export class FillerEngine {
  // Passes in the required field as form of input and fill in those values appropriately
  // via DOM

  constructor () {}

  fill (element, fieldType, value) {
    if (fieldType != null) {
      console.log(fieldType)
      if (fieldType === QType.TEXT) {
        return this.fillText(element,"this is text")
      } else if (fieldType === QType.TEXT_EMAIL) {
        return this.fillEmail(element,'harshit123@gmail.com')
      } else if (fieldType === QType.PARAGRAPH) {
        return this.fillParagraph(element,"this is a paragraph")
      } else if (fieldType === QType.DATE) {
        return this.fillDate(element,"15-11-2030")
      } else if (fieldType === QType.DATE_AND_TIME) {
        return this.fillDate_And_Time(element, '22-01-2033-17-11')
      } else if (fieldType === QType.TIME) {
        return this.fillTime(element, '23-22')
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
        return this.fillDuration(element, '10-11-11')
      } else if (fieldType === QType.DATE_WITHOUT_YEAR) {
        return this.fillDate_Without_Year(element, '11-11')
      } else if (fieldType === QType.DATE_TIME_WITHOUT_YEAR) {
        return this.fillDate_Time_Without_Year(element, '23-10-23-21')
      } else {
        return false
      }
    } else {
      return false
    }
  }

  fillText (element, value) {
    // Function to fill question with type text input with a specified value.
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    var inputField = element.querySelectorAll('input[type=text]')
    inputField = inputField[0]
    inputField.value = value
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)
    return true
  }

  fillEmail (element, value) {
    // Function to fill email
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    var inputField = element.querySelectorAll(
      'input[type=text], input[type=email]'
    )
    inputField = inputField[0]
    inputField.value =value
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)
    return true
  }

  fillParagraph (element, value) {
    // Function to fill paragraph type questions
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    var inputField = element.querySelectorAll('textarea')
    inputField = inputField[0]
    inputField.value = value
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)
    return true
  }

  
  //*********** it may raise a problem if format is different need to look into this  ************/
  
  fillDate (element, value) {
    // Function to fill date
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    // value format :- "dd-mm-yyyy"
    // Validate the date format
    const datePattern = /^(\d{2})-(\d{2})-(\d{4})$/

    if (!datePattern.test(value)) {
      // Invalid format
      return false
    }

    const [day, month, year] = value.split('-')
    const date = new Date(`${year}-${month}-${day}`)

    if (
      !(
        date.getDate() === Number(day) &&
        date.getMonth() + 1 === Number(month) &&
        date.getFullYear() === Number(year)
      )
    ) {
      console.log('Invalid date format or an invalid date.')
      return false
    }

    // 1. Fill the day input field
    var inputField = element.querySelectorAll(
      'input[type=text], input[type=date]'
    )
    inputField = inputField[0]
    inputField.value = day
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    // 2. Fill the month input field
    inputField = element.querySelectorAll('input[type=text], input[type=date]')
    inputField = inputField[1]
    inputField.value = month
    inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    // 3. Fill the year input field
    inputField = element.querySelectorAll('input[type=text], input[type=date]')
    inputField = inputField[2]
    inputField.value = year
    inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    return true
  }

  async fillDate_And_Time (element, datevariable) {
    // Function to fill date and time
    // Input Type : DOM object(element) & datevariable(value)
    // Tweak : 
    // Return Type : Boolean
    // value format :- "dd-mm-yyyy-hh-mm"
    // hh in 24 hrs format

    //sleep done because form was overriding values set by this function before
    await sleep(1500)

    // Validate the date format
    const datePattern = /^(\d{2})-(\d{2})-(\d{4})$/

    const [day, month, year, hours, minutes] = datevariable.split('-')
    const date = new Date(`${year}-${month}-${day}`)

    if (
      !(
        date.getDate() === Number(day) &&
        date.getMonth() + 1 === Number(month) &&
        date.getFullYear() === Number(year)
      )
    ) {
      console.log('Invalid date format or an invalid date.')
      return false
    }

    // 1. Fill the day input field
    var inputField = element.querySelectorAll(
      'input[type=text], input[type=date]'
    )
    inputField = inputField[0]
    inputField.value = day
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    // 2. Fill the month input field
    inputField = element.querySelectorAll('input[type=text], input[type=date]')
    inputField = inputField[1]
    inputField.value = month
    inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    // 3. Fill the year input field
    inputField = element.querySelectorAll('input[type=text], input[type=date]')
    inputField = inputField[2]
    inputField.value = year
    inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    // TIME

    //hours
    var inputField = element.querySelectorAll('input[type=text]')
    inputField = inputField[3]
    inputField.value = hours
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    //minutes
    var inputField = element.querySelectorAll('input[type=text]')
    inputField = inputField[4]
    inputField.value = minutes
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    return true
  }

  fillTime (element, value) {
    // Function to fill time
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    // value format :- "hh-mm"
    // hh in 24 hrs format
    const [hours, minutes] = value.split('-')

    // TIME

    //hours
    var inputField = element.querySelectorAll('input[type=text]')
    inputField = inputField[0]
    inputField.value = hours
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    //minutes
    var inputField = element.querySelectorAll('input[type=text]')
    inputField = inputField[1]
    inputField.value = minutes
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    return true
  }

  fillDuration (element, value) {
    // Function to fill time
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    // value format :- "hh-mm-ss"
    // hh in 24 hrs format
    const [hours, minutes, seconds] = value.split('-')

    // TIME

    //seconds
    var inputField = element.querySelectorAll('input[type=text]')
    inputField = inputField[0]
    inputField.value = hours
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    //minutes
    var inputField = element.querySelectorAll('input[type=text]')
    inputField = inputField[1]
    inputField.value = minutes
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    //seconds
    var inputField = element.querySelectorAll('input[type=text]')
    inputField = inputField[2]
    inputField.value = seconds
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    return true
  }

  fillDate_Without_Year (element, value) {
    // Function to fill date without year
    // value format :- "dd-mm"
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    const [day, month] = value.split('-')

    // 1. Fill the day input field
    var inputField = element.querySelectorAll(
      'input[type=text], input[type=date]'
    )
    inputField = inputField[0]
    inputField.value = day
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    // 2. Fill the month input field
    inputField = element.querySelectorAll('input[type=text], input[type=date]')
    inputField = inputField[1]
    inputField.value = month
    inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    return true
  }

  async fillDate_Time_Without_Year (element, value) {
    // Function to fill time
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    // value format :- "dd-mm-hh-mm"
    // hh in 24 hrs format

     //! to avoid the race around between our answer and default NULL value
     await sleep(2000)
     
    const [day, month, hours, minutes] = value.split('-')

    // 1. Fill the day input field
    var inputField = element.querySelectorAll(
      'input[type=text], input[type=date]'
    )
    inputField = inputField[0]
    inputField.value = day
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    // 2. Fill the month input field
    inputField = element.querySelectorAll('input[type=text], input[type=date]')
    inputField = inputField[1]
    inputField.value = month
    inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    // TIME

    //hours
    var inputField = element.querySelectorAll('input[type=text]')
    inputField = inputField[2]
    inputField.value = hours
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)

    //minutes
    var inputField = element.querySelectorAll('input[type=text]')
    inputField = inputField[3]
    inputField.value = minutes
    var inputEvent = new Event('input', { bubbles: true })
    inputField.dispatchEvent(inputEvent)

    return true
  }


  // to be completed 

  // fillMultiple_Choice_Grid(element, value) {
  //   let  flag=-1;
  //   let inputFields = element.querySelectorAll(
  //     'div[role=radiogroup]'
  //   )
  //   inputFields.forEach(element => {
  //     let option = element.querySelectorAll('div[role=radio]')

  //     option.forEach(element => {
  //     if(element===)
  //     {
  //       option.click();
  //     }
  //     else{
  //       flag=1;
  //     }
        
  //       })

  //     })
  //   return true;
  // }

  async fillCheckBox (element, value) {
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
      if (otherOption.length != 0) {
        var otherOptionName = otherOption[0].getAttribute('aria-label')
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
}
