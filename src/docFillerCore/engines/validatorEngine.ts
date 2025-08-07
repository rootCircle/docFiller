import { QType } from '@utils/questionTypes';
import { EMPTY_STRING } from '@utils/settings';

export class ValidatorEngine {
  public validate(
    fieldType: QType,
    extractedValue: ExtractedValue,
    response: LLMResponse,
  ): boolean | null {
    if (!response) {
      return false;
    }

    // In Chromium-based browsers, the response from background service worker after invoking LLM
    // is somehow a string, not a Date object. This happens because when the extension communicates
    // with the background service worker via `chrome.runtime.onMessage`, Date objects get converted
    // to strings during the message passing process.
    //
    // Flow: extension -> background service worker -> LLM API ->
    // Date object as response in background worker -> chrome.runtime.onMessage ->
    // extension caller -> Date becomes string automatically
    if (response?.date && !(response.date instanceof Date)) {
      // If the date is not a Date object, assume it's a string and try to convert it
      const date = new Date(response.date);
      if (Number.isNaN(date.getTime())) {
        return false;
      }
      response.date = date;
    }

    if (fieldType !== null && extractedValue !== null) {
      switch (fieldType) {
        case QType.TEXT:
          return this.validateText(response);
        case QType.TEXT_EMAIL:
          return this.validateEmail(response);
        case QType.MULTI_CORRECT_WITH_OTHER:
          return this.validateMultiCorrectWithOther(extractedValue, response);
        case QType.MULTI_CORRECT:
          return this.validateMultiCorrect(extractedValue, response);
        case QType.PARAGRAPH:
          return this.validateParagraph(response);
        case QType.DATE:
          return this.validateDate(response);
        case QType.DATE_AND_TIME:
          return this.validateDateAndTime(response);
        case QType.TIME:
          return this.validateTime(response);
        case QType.DURATION:
          return this.validateDuration(response);
        case QType.DATE_WITHOUT_YEAR:
          return this.validateDateWithoutYear(response);
        case QType.DATE_TIME_WITHOUT_YEAR:
          return this.validateDateTimeWithoutYear(response);
        case QType.MULTIPLE_CHOICE:
          return this.validateMultipleChoice(extractedValue, response);
        case QType.MULTIPLE_CHOICE_WITH_OTHER:
          return this.validateMultipleChoiceWithOther(extractedValue, response);
        case QType.LINEAR_SCALE_OR_STAR:
          return this.validateLinearScale(extractedValue, response);

        case QType.MULTIPLE_CHOICE_GRID:
          return this.validateMultipleChoiceGrid(extractedValue, response);

        case QType.CHECKBOX_GRID:
          return this.validateCheckBoxGrid(extractedValue, response);
        case QType.DROPDOWN:
          return this.validateDropdown(extractedValue, response);
        case QType.DATE_TIME_WITH_MERIDIEM:
          return this.validateDateTimeWithMeridiem(response);
        case QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR:
          return this.validateDateTimeWithMeridiemWithoutYear(response);
        case QType.TEXT_URL:
          return this.validateTextUrl(response);
        case QType.TIME_WITH_MERIDIEM:
          return this.validateTimeWithMeridiem(response);
      }
    }
    return false;
  }

  private validateText(response: LLMResponse): boolean {
    if (!response.text) {
      return false;
    }
    return this.__validateText(response.text);
  }

  private __validateText(text: string): boolean {
    const trimmedText = text.trim();
    return (
      trimmedText.length > 0 &&
      !(trimmedText.includes('\n') || trimmedText.includes('\r'))
    );
  }

  private validateTextUrl(response: LLMResponse): boolean {
    if (!response.genericResponse) {
      return false;
    }
    return this.__validateText(response.genericResponse.answer);
  }

  private validateParagraph(response: LLMResponse): boolean {
    if (!response.text) {
      return false;
    }
    return response.text?.trim().length > 0;
  }

  private validateEmail(response: LLMResponse): boolean {
    if (!response.genericResponse) {
      return false;
    }
    // Checking valid email in accord to RFC 5322
    // https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression/201378#201378

    const mailRegex =
      // biome-ignore lint/suspicious/noControlCharactersInRegex: email validation regex requires control characters
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    return !!response?.genericResponse?.answer?.match(mailRegex);
  }

  private validateDate(response: LLMResponse): boolean {
    if (!response.date) {
      return false;
    }
    return (
      response.date instanceof Date && !Number.isNaN(response.date.valueOf())
    );
  }

  private validateDateAndTime(response: LLMResponse): boolean {
    if (!response.date) {
      return false;
    }
    return this.validateDate(response);
  }

  private validateTime(response: LLMResponse): boolean {
    if (!response.date) {
      return false;
    }
    return this.validateDate(response);
  }

  private validateTimeWithMeridiem(response: LLMResponse): boolean {
    if (!response.date) {
      return false;
    }
    return this.validateDate(response);
  }

  private validateDuration(response: LLMResponse): boolean {
    if (!response.date) {
      return false;
    }
    return this.validateDate(response);
  }

  private validateDateWithoutYear(response: LLMResponse): boolean {
    if (!response.date) {
      return false;
    }
    return this.validateDate(response);
  }

  private validateDateTimeWithoutYear(response: LLMResponse): boolean {
    if (!response.date) {
      return false;
    }
    return this.validateDate(response);
  }

  private validateDateTimeWithMeridiem(response: LLMResponse): boolean {
    if (!response.date) {
      return false;
    }
    return this.validateDate(response);
  }

  private validateDateTimeWithMeridiemWithoutYear(
    response: LLMResponse,
  ): boolean {
    if (!response.date) {
      return false;
    }
    return this.validateDate(response);
  }

  private validateMultiCorrect(
    extractedValue: ExtractedValue,
    response: LLMResponse,
  ): boolean {
    if (!response.multiCorrect) {
      return false;
    }
    const responseOptions = response.multiCorrect
      .map((option) => option.optionText?.trim())
      .filter((text) => Boolean(text));

    const actualOptions = extractedValue.options?.map((option) =>
      option.data.trim().toLowerCase(),
    );

    return responseOptions.every(
      (option) => option && actualOptions?.includes(option.toLowerCase()),
    );
  }

  private validateMultiCorrectWithOther(
    extractedValue: ExtractedValue,
    response: LLMResponse,
  ): boolean {
    if (!response.multiCorrect) {
      return false;
    }
    const isMulticorrect = this.validateMultiCorrect(extractedValue, response);
    const isValidOther = response.multiCorrect.some(
      (option) =>
        option.isOther &&
        option.otherOptionValue &&
        this.__validateText(option?.otherOptionValue),
    );
    return isMulticorrect || isValidOther;
  }

  private validateMultipleChoice(
    extractedValue: ExtractedValue,
    response: LLMResponse,
  ): boolean {
    if (!response.multipleChoice) {
      return false;
    }
    if (typeof response.multipleChoice.optionText !== 'string') {
      return false;
    }

    const trimmedResponse = response.multipleChoice.optionText
      .trim()
      .toLowerCase();

    const actualOptions =
      extractedValue.options?.map((option) =>
        option.data.trim().toLowerCase(),
      ) || [];

    const isValid = actualOptions.includes(trimmedResponse);
    return isValid;
  }

  private validateMultipleChoiceWithOther(
    extractedValue: ExtractedValue,
    response: LLMResponse,
  ): boolean {
    if (!response.multipleChoice) {
      return false;
    }
    const isValidChoice = this.validateMultipleChoice(extractedValue, response);

    const isOtherOption =
      (response.multipleChoice.isOther ?? false) &&
      response.multipleChoice.otherOptionValue &&
      this.__validateText(response.multipleChoice.otherOptionValue);

    return isValidChoice || Boolean(isOtherOption);
  }

  private validateLinearScale(
    extractedValue: ExtractedValue,
    response: LLMResponse,
  ): boolean {
    if (!response.linearScale) {
      return false;
    }
    const validOptions = (extractedValue.options ?? []).map(
      (option) => option.data,
    );

    return validOptions.includes(
      response.linearScale?.answer.toString() ?? EMPTY_STRING,
    );
  }

  private validateMultipleChoiceGrid(
    extractedValue: ExtractedValue,
    response: LLMResponse,
  ): boolean {
    if (!response.multipleChoiceGrid) {
      return false;
    }
    if (
      response.multipleChoiceGrid.length !==
      (extractedValue.rowColumnOption || []).length
    ) {
      return false;
    }

    return response.multipleChoiceGrid.every((responseRow, rowIndex) => {
      const actualRow = extractedValue.rowColumnOption?.[rowIndex];
      if (!actualRow) {
        return false;
      }

      const selectedColumn = responseRow.selectedColumn.trim().toLowerCase();

      const actualColumns = actualRow.cols.map((col) =>
        col.data.trim().toLowerCase(),
      );

      return actualColumns.includes(selectedColumn);
    });
  }

  private validateCheckBoxGrid(
    extractedValue: ExtractedValue,
    response: LLMResponse,
  ): boolean {
    if (!response.checkboxGrid) {
      return false;
    }
    if (
      response.checkboxGrid.length !==
      (extractedValue.rowColumnOption || []).length
    ) {
      return false;
    }

    return response.checkboxGrid.every((responseRow, rowIndex) => {
      const actualRow = extractedValue.rowColumnOption?.[rowIndex];
      if (!actualRow) {
        return false;
      }

      const selectedColumns = responseRow.cols.map((col) =>
        col.data.trim().toLowerCase(),
      );

      const actualColumns = actualRow.cols.map((col) =>
        col.data.trim().toLowerCase(),
      );

      return selectedColumns.every((selectedCol) =>
        actualColumns.includes(selectedCol),
      );
    });
  }

  private validateDropdown(
    extractedValue: ExtractedValue,
    response: LLMResponse,
  ): boolean {
    if (!response.genericResponse) {
      return false;
    }
    const validOptions = (extractedValue.options ?? []).map(
      (option) => option.data,
    );
    return validOptions.includes(
      response.genericResponse?.answer ?? EMPTY_STRING,
    );
  }
}
