import QType from '../../utils/question-types'

function sleep (milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export class FillerEngine {
  // Passes in the required field as form of input and fill in those values appropriately
  // via DOM

  constructor () {}

  fill(element, fieldType, fieldValue, value) {
    if (fieldType != null) {
      console.log(fieldType)
      if (fieldType === QType.TEXT) {
        return this.fillText(element, fieldValue,"this is text")
      } else if (fieldType === QType.TEXT_EMAIL) {
        return this.fillEmail(element, fieldValue,'harshit123@gmail.com')
      } else if (fieldType === QType.PARAGRAPH) {
        return this.fillParagraph(element, fieldValue,"this is a paragraph ")
      } else if (fieldType === QType.DATE) {
        return this.fillDate(element, fieldValue,"11-11-2111")
      } else if (fieldType === QType.DATE_AND_TIME) {
        return this.fillDate_And_Time(element, fieldValue, '01-01-2003-01-01')
      } else if (fieldType === QType.TIME) {
        return this.fillTime(element,fieldValue, '02-02')
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
        return this.fillDuration(element, fieldValue, '11-11-11')
      } else if (fieldType === QType.DATE_WITHOUT_YEAR) {
        return this.fillDate_Without_Year(element, fieldValue, '11-11')
      } else if (fieldType === QType.DATE_TIME_WITHOUT_YEAR) {
        return this.fillDate_Time_Without_Year(element, fieldValue, '22-01-01-01')
      } else {
        return false
      }
    } else {
      return false
    }
  }

  fillText (element, fieldValue, value) {
    // Function to fill question with type text input with a specified value.
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    // console.log(fieldValue.dom[0]);
   let inputField = fieldValue.dom[0]
    inputField.value = value
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)
    return true
  }

  fillEmail (element, fieldValue, value) {
    // Function to fill email
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    let inputField = fieldValue.dom[0]
    inputField.value =value
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)
    return true
  }

  fillParagraph (element, fieldValue, value) {
    // Function to fill paragraph type questions
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    let inputField = fieldValue.dom[0]
    inputField.value = value
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    inputField.dispatchEvent(inputEvent)
    return true
  }

  
  //*********** it may raise a problem if format is different need to look into this  ************/
  
  fillDate (element, fieldValue, value) {
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
   let dd = fieldValue.dom[0]
    dd.value = day
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    dd.dispatchEvent(inputEvent)

    // 2. Fill the month input field
   let mm = fieldValue.dom[1]
    mm.value = month
    inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    mm.dispatchEvent(inputEvent)

    // 3. Fill the year input field
   let yyyy = fieldValue.dom[2]
    yyyy.value = year
    inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    yyyy.dispatchEvent(inputEvent)

    return true
  }

  async fillDate_And_Time (element, fieldValue, datevariable) {
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
   let dd = fieldValue.dom[0]
     dd.value = day
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    dd.dispatchEvent(inputEvent)

    // 2. Fill the month input field
    // inputField = element.querySelectorAll('input[type=text], input[type=date]')
   let mm = fieldValue.dom[1]
    mm.value = month
    inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    mm.dispatchEvent(inputEvent)

    // 3. Fill the year input field
    // inputField = element.querySelectorAll('input[type=text], input[type=date]')
   let yyyy = fieldValue.dom[2]
    yyyy.value = year
    inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    yyyy.dispatchEvent(inputEvent)

    // TIME

    //hours
    // var inputField = element.querySelectorAll('input[type=text]')
    let hh = fieldValue.dom[3]
    hh.value = hours
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    hh.dispatchEvent(inputEvent)

    //minutes
    // var inputField = element.querySelectorAll('input[type=text]')
    let min = fieldValue.dom[4]
    min.value = minutes
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    min.dispatchEvent(inputEvent)

    return true
  }

  fillTime (element, fieldValue, value) {
    // Function to fill time
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    // value format :- "hh-mm"
    // hh in 24 hrs format
    const [hours, minutes] = value.split('-')

    // TIME

    //hours
   let hh = fieldValue.dom[0]
    hh.value = hours
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners boundmin hh.dispatchEvent(inputEvent)
    hh.dispatchEvent(inputEvent)

    //minutes
    // var inputField = element.querySelectorAll('input[type=text]')
  let  min =fieldValue.dom[1]
    min.value = minutes
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    min.dispatchEvent(inputEvent)

    return true
  }

  fillDuration (element, fieldValue, value) {
    // Function to fill time
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    // value format :- "hh-mm-ss"
    // hh in 24 hrs format
    const [hours, minutes, seconds] = value.split('-')

    // TIME

    //seconds
    let hh = fieldValue.dom[0]
    hh.value = hours
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    hh.dispatchEvent(inputEvent)

    //minutes
    let mm =fieldValue.dom[1]
    mm.value = minutes
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    mm.dispatchEvent(inputEvent)

    //seconds
    // var inputField = element.querySelectorAll('input[type=text]')
    let ss = fieldValue.dom[2]
    ss.value = seconds
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    ss.dispatchEvent(inputEvent)

    return true
  }

  fillDate_Without_Year (element, fieldValue, value) {
    // Function to fill date without year
    // value format :- "dd-mm"
    // Input Type : DOM object(element) & string(value)
    // Tweak : 
    // Return Type : Boolean
    const [day, month] = value.split('-')

    // 1. Fill the day input field
    let dd = fieldValue.dom[0]
    dd.value = day
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    dd.dispatchEvent(inputEvent)

    // 2. Fill the month input field
   let mm =fieldValue.dom[1]
    mm.value = month
    inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    mm.dispatchEvent(inputEvent)

    return true
  }

  async fillDate_Time_Without_Year (element, fieldValue, value) {
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
   let dd =fieldValue.dom[0]
    dd.value = day
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    dd.dispatchEvent(inputEvent)

    // 2. Fill the month input field
   let mm = fieldValue.dom[1]
    mm.value = month
    inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    mm.dispatchEvent(inputEvent)

    // TIME

    //hours
   let hh = fieldValue.dom[2]
    hh.value = hours
    var inputEvent = new Event('input', { bubbles: true })
    // Dispatch the 'input' event on the input field to trigger any event listeners bound to it.
    hh.dispatchEvent(inputEvent)

    //minutes
   let min = fieldValue.dom[3]
    min.value = minutes
    var inputEvent = new Event('input', { bubbles: true })
    min.dispatchEvent(inputEvent)

    return true
  }

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
