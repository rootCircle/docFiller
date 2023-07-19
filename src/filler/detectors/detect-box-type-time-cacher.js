export class DetectBoxTypeTimeCacher {
  // A Cacher Engine for Date/Time based field boxes
  // This can help eliminate calling multiple same DOM queries repeatedly
  // Value validation is based on the argument, not the output
  // An Utility class for DetectBoxType class.

  constructor() {
    // Initializing all values to null
    this.element = null;
    this.inputFieldCount = null;
    this.hasYear = null;
    this.hasMonth = null;
    this.hasDate = null;
    this.hasHour = null;
    this.hasMinute = null;
    this.hasSecond = null;
    this.hasMeridiemField = null;
  }

  getTimeParams(element, invalidateCache = false) {
    // Input : element -> DOM Object
    //         invalidateCache -> Boolean (Forcefully invalidate all Caches)
    // DOM queries are only run, if forced to or if cache was not created for the element
    // Return Type : Array of length 8, with each element of type Boolean except first, which is an Integer.
    if (element !== this.element || invalidateCache) {
      // Storing input argument and output simultaneously
      this.element = element;
      this.inputFieldCount = element.querySelectorAll("input").length;
      this.hasYear = Boolean(element.querySelector('input[aria-label="Year"]'));
      this.hasMonth = Boolean(
        element.querySelector('input[aria-label="Month"]')
      );
      this.hasDate = Boolean(
        element.querySelector('input[aria-label="Day of the month"]')
      );
      this.hasHour = Boolean(element.querySelector('input[aria-label="Hour"]'));
      this.hasMinute = Boolean(
        element.querySelector('input[aria-label="Minute"]')
      );
      this.hasSecond = Boolean(
        element.querySelector('input[aria-label="Seconds"]')
      );

      // Works the same with data-value=PM
      this.hasMeridiemField = Boolean(
        element.querySelector("div[role=option][data-value=AM]")
      );
    }
    // else {
    // 	console.log("Using cached Values for DetectBoxTypeTimeCacher");
    // }

    // Returns an array of argument, which can be later unpacked
    return [
      this.inputFieldCount,
      this.hasYear,
      this.hasMonth,
      this.hasDate,
      this.hasHour,
      this.hasMinute,
      this.hasSecond,
      this.hasMeridiemField,
    ];
  }
}
