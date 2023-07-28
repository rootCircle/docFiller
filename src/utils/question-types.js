// import and use this ENUM for referring to question types, as it will be more convenient throughout the code rather than hardcoding the string values for each type
const QType = {
  DROPDOWN: "Dropdown",
  TEXT: "Text",
  PARAGRAPH: "Paragraph",
  TEXT_EMAIL: "Text Email",
  TEXT_NUMERIC: "Text Numeric",
  TEXT_TEL: "Text Telephonic",
  TEXT_URL: "Text URL",
  MULTI_CORRECT: "Multi Correct",
  MULTI_CORRECT_WITH_OTHER: "MultiCorrect With Other",
  MULTIPLE_CHOICE: "Multiple Choice",
  MULTIPLE_CHOICE_WITH_OTHER: "Multiple Choice With Other",
  MULTIPLE_CHOICE_GRID: "Multiple Choice Grid",
  CHECKBOX_GRID: "Checkbox Grid",
  DATE: "Date",
  DATE_AND_TIME: "Date And Time",
  TIME: "Time",
  DURATION: "Duration",
  DATE_WITHOUT_YEAR: "Date without Year",
  DATE_TIME_WITHOUT_YEAR: "Date without Year with Time",
  DATE_TIME_WITH_MERIDIEM: "Date with Time and Meridiem",
  TIME_WITH_MERIDIEM: "Time and Meridiem",
  DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR: "Date without Year with Time and Meridiem",
  LINEAR_SCALE: "Linear Scale",
};

export default QType;
