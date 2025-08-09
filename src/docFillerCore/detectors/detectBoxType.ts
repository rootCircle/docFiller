import { DetectBoxTypeTimeCacher } from '@docFillerCore/detectors/detectBoxTypeTimeCacher';
import { QType } from '@utils/questionTypes';
import { EMPTY_STRING } from '@utils/settings';

export class DetectBoxType {
  private timeCacher: DetectBoxTypeTimeCacher;

  constructor() {
    this.timeCacher = new DetectBoxTypeTimeCacher();
  }

  public detectType = (element: HTMLElement): QType | null => {
    const possibleBoxesMethod: {
      [key in QType]: boolean;
    } = {
      [QType.DROPDOWN]: this.isDropdown(element),
      [QType.PARAGRAPH]: this.isParagraph(element),
      [QType.TEXT_EMAIL]: this.isTextEmail(element),
      [QType.TEXT_URL]: this.isTextURL(element),
      [QType.MULTI_CORRECT]: this.isMultiCorrect(element),
      [QType.MULTI_CORRECT_WITH_OTHER]: this.isMultiCorrectWithOther(element),
      [QType.LINEAR_SCALE_OR_STAR]: this.isLinearScale(element),
      [QType.MULTIPLE_CHOICE]: this.isMultipleChoice(element),
      [QType.MULTIPLE_CHOICE_WITH_OTHER]:
        this.isMultipleChoiceWithOther(element),
      [QType.MULTIPLE_CHOICE_GRID]: this.isMultipleChoiceGrid(element),
      [QType.CHECKBOX_GRID]: this.isCheckboxGrid(element),
      [QType.DATE]: this.isDate(element),
      [QType.DATE_AND_TIME]: this.isDateAndTime(element),
      [QType.TIME]: this.isTime(element),
      [QType.DURATION]: this.isDuration(element),
      [QType.DATE_WITHOUT_YEAR]: this.isDateWithoutYear(element),
      [QType.DATE_TIME_WITHOUT_YEAR]: this.isDateWithoutYearWithTime(element),
      [QType.DATE_TIME_WITH_MERIDIEM]: this.isDateAndTimeWithMeridiem(element),
      [QType.TIME_WITH_MERIDIEM]: this.isTimeWithMeridiem(element),
      [QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR]:
        this.isDateWithoutYearWithTimeAndMeridiem(element),
      [QType.TEXT]: this.isText(element),
    };

    for (const key in possibleBoxesMethod) {
      if (possibleBoxesMethod[key as QType]) {
        return key as QType;
      }
    }

    return null;
  };

  public isDropdown(element: HTMLElement): boolean {
    return Boolean(
      element.querySelector('div[role=listbox]') &&
        !element.querySelector('input'),
    );
  }

  private isText(element: HTMLElement): boolean {
    const inputFields = element.querySelectorAll('input');
    const inputType =
      inputFields.length === 1 ? inputFields[0]?.getAttribute('type') : null;
    return (
      inputFields.length === 1 &&
      inputType !== 'hidden' &&
      !['email', 'tel', 'url', 'number', 'date'].includes(
        inputType ?? EMPTY_STRING,
      )
    );
  }

  private isParagraph(element: HTMLElement): boolean {
    return Boolean(element.querySelector('textarea'));
  }

  private isTextEmail(element: HTMLElement): boolean {
    return Boolean(element.querySelector('input[type=email]'));
  }

  private isTextURL(element: HTMLElement): boolean {
    return Boolean(element.querySelector('input[type=url]'));
  }

  private isMultiCorrect(element: HTMLElement): boolean {
    const options = element.querySelectorAll('div[role=list] label');
    const optionCount = options.length;
    return Boolean(
      element.querySelector('div[role=list]') &&
        !(
          optionCount > 0 &&
          options?.[optionCount - 1]?.nextElementSibling &&
          options?.[optionCount - 1]?.nextElementSibling?.querySelector(
            'input:not([type=hidden])',
          )
        ),
    );
  }

  private isMultiCorrectWithOther(element: HTMLElement): boolean {
    const options = element.querySelectorAll('div[role=list] label');
    const optionCount = options.length;
    return Boolean(
      element.querySelector('div[role=list]') &&
        optionCount > 0 &&
        options[optionCount - 1]?.nextElementSibling &&
        options[optionCount - 1]?.nextElementSibling?.querySelector(
          'input:not([type=hidden])',
        ),
    );
  }

  private isLinearScale(element: HTMLElement): boolean {
    const optionBox = element.querySelector('div[role=radiogroup] label');
    return Boolean(
      optionBox?.querySelector('div') && !optionBox.querySelector('span'),
    );
  }

  private isMultipleChoice(element: HTMLElement): boolean {
    const options = element.querySelectorAll('div[role=radiogroup] label');
    const optionCount = options.length;
    return Boolean(
      element.querySelector('div[role=radiogroup] label span') &&
        !(
          optionCount > 0 &&
          options[optionCount - 1]?.nextElementSibling &&
          options[optionCount - 1]?.nextElementSibling?.querySelector(
            'input:not([type=hidden])',
          )
        ),
    );
  }

  private isMultipleChoiceWithOther(element: HTMLElement): boolean {
    const options = element.querySelectorAll('div[role=radiogroup] label');
    const optionCount = options.length;
    return Boolean(
      element.querySelector('div[role=radiogroup] label span') &&
        optionCount > 0 &&
        options[optionCount - 1]?.nextElementSibling &&
        options[optionCount - 1]?.nextElementSibling?.querySelector(
          'input:not([type=hidden])',
        ),
    );
  }

  private isCheckboxGrid(element: HTMLElement): boolean {
    return Boolean(
      element.querySelector('div[role=group] label div[role=checkbox]'),
    );
  }

  private isMultipleChoiceGrid(element: HTMLElement): boolean {
    /**
     *  UNSTABLE [Refer Tweak for details]
     *  Tweak:
     *  - Multiple Grid are grouped horizontally for each row.
     *  - It was expectedly known that each row has
     *    a `radiogroup` role for each containing row.
     *  - Inside that div houses a span with `presentation` role still housing the entire row.
     *  - But the same feature is realized for Multiple Choice and Linear Scale.
     *  - To differentiate, we had to extract rendered style properties for that span.
     *    Any design changes done externally will make this unusable.
     *  - To differentiate, we are checking the display property for the rendered span to be `table-row`.
     *    The other two, Multiple Choice and Linear Scale, have a display property set to `flex`.
     *  - This means any external extension redesigning the page may break this function.
     *  - To be extra pedantic, we ensure that the child of that span actually has radio buttons,
     *    which is a div with role `radio`.
     */

    const radioGroups = element.querySelector(
      'div[role=radiogroup] span[role=presentation]',
    );
    const hasTableRowDisplay =
      radioGroups && getComputedStyle(radioGroups).display === 'table-row';
    return Boolean(
      hasTableRowDisplay && radioGroups.querySelector('div[role=radio]'),
    );
  }

  private isDate(element: HTMLElement): boolean {
    const [
      inputFieldCount,
      hasYear,
      hasMonth,
      hasDate,
      hasHour,
      hasMinute,
      hasSecond,
      hasMeridiemField,
      isChromeDateField,
    ] = this.timeCacher.getTimeParams(element);

    // For chromium based browsers
    if (isChromeDateField) {
      return Boolean(
        inputFieldCount === 1 &&
          !hasYear &&
          !hasMonth &&
          !hasDate &&
          !hasHour &&
          !hasMinute &&
          !hasSecond &&
          !hasMeridiemField,
      );
    }

    return Boolean(
      inputFieldCount === 3 &&
        hasYear &&
        hasMonth &&
        hasDate &&
        !hasHour &&
        !hasMinute &&
        !hasSecond &&
        !hasMeridiemField,
    );
  }

  private isDateAndTime(element: HTMLElement): boolean {
    const [
      inputFieldCount,
      hasYear,
      hasMonth,
      hasDate,
      hasHour,
      hasMinute,
      hasSecond,
      hasMeridiemField,
      isChromeDateField,
    ] = this.timeCacher.getTimeParams(element);

    // For chromium based browsers
    if (isChromeDateField) {
      return Boolean(
        inputFieldCount === 3 &&
          !hasYear &&
          !hasMonth &&
          !hasDate &&
          hasHour &&
          hasMinute &&
          !hasSecond &&
          !hasMeridiemField,
      );
    }

    return Boolean(
      inputFieldCount === 5 &&
        hasYear &&
        hasMonth &&
        hasDate &&
        hasHour &&
        hasMinute &&
        !hasSecond &&
        !hasMeridiemField,
    );
  }

  private isTime(element: HTMLElement): boolean {
    const [
      inputFieldCount,
      hasYear,
      hasMonth,
      hasDate,
      hasHour,
      hasMinute,
      hasSecond,
      hasMeridiemField,
      _isChromeDateField,
    ] = this.timeCacher.getTimeParams(element);

    return Boolean(
      inputFieldCount === 2 &&
        !hasYear &&
        !hasMonth &&
        !hasDate &&
        hasHour &&
        hasMinute &&
        !hasSecond &&
        !hasMeridiemField,
    );
  }

  private isDuration(element: HTMLElement): boolean {
    const [
      inputFieldCount,
      hasYear,
      hasMonth,
      hasDate,
      _hasHour,
      _hasMinute,
      hasSecond,
      hasMeridiemField,
      _isChromeDateField,
    ] = this.timeCacher.getTimeParams(element);

    const hasHourReal = Boolean(
      element.querySelector('input[aria-label="Hours"]'),
    );
    const hasMinuteReal = Boolean(
      element.querySelector('input[aria-label="Minutes"]'),
    );

    return Boolean(
      inputFieldCount === 3 &&
        !hasYear &&
        !hasMonth &&
        !hasDate &&
        hasHourReal &&
        hasMinuteReal &&
        hasSecond &&
        !hasMeridiemField,
    );
  }

  private isDateWithoutYear(element: HTMLElement): boolean {
    const [
      inputFieldCount,
      hasYear,
      hasMonth,
      hasDate,
      hasHour,
      hasMinute,
      hasSecond,
      hasMeridiemField,
      _isChromeDateField,
    ] = this.timeCacher.getTimeParams(element);

    return Boolean(
      inputFieldCount === 2 &&
        !hasYear &&
        hasMonth &&
        hasDate &&
        !hasHour &&
        !hasMinute &&
        !hasSecond &&
        !hasMeridiemField,
    );
  }

  private isDateWithoutYearWithTime(element: HTMLElement): boolean {
    const [
      inputFieldCount,
      hasYear,
      hasMonth,
      hasDate,
      hasHour,
      hasMinute,
      hasSecond,
      hasMeridiemField,
      _isChromeDateField,
    ] = this.timeCacher.getTimeParams(element);

    return Boolean(
      inputFieldCount === 4 &&
        !hasYear &&
        hasMonth &&
        hasDate &&
        hasHour &&
        hasMinute &&
        !hasSecond &&
        !hasMeridiemField,
    );
  }

  private isDateAndTimeWithMeridiem(element: HTMLElement): boolean {
    const [
      inputFieldCount,
      hasYear,
      hasMonth,
      hasDate,
      hasHour,
      hasMinute,
      hasSecond,
      hasMeridiemField,
      isChromeDateField,
    ] = this.timeCacher.getTimeParams(element);

    // For chromium based browsers
    if (isChromeDateField) {
      return Boolean(
        inputFieldCount === 3 &&
          !hasYear &&
          !hasMonth &&
          !hasDate &&
          hasHour &&
          hasMinute &&
          !hasSecond &&
          hasMeridiemField,
      );
    }

    return Boolean(
      inputFieldCount === 5 &&
        hasYear &&
        hasMonth &&
        hasDate &&
        hasHour &&
        hasMinute &&
        !hasSecond &&
        hasMeridiemField,
    );
  }

  private isTimeWithMeridiem(element: HTMLElement): boolean {
    const [
      inputFieldCount,
      hasYear,
      hasMonth,
      hasDate,
      hasHour,
      hasMinute,
      hasSecond,
      hasMeridiemField,
      _isChromeDateField,
    ] = this.timeCacher.getTimeParams(element);

    return Boolean(
      inputFieldCount === 2 &&
        !hasYear &&
        !hasMonth &&
        !hasDate &&
        hasHour &&
        hasMinute &&
        !hasSecond &&
        hasMeridiemField,
    );
  }

  private isDateWithoutYearWithTimeAndMeridiem(element: HTMLElement): boolean {
    const [
      inputFieldCount,
      hasYear,
      hasMonth,
      hasDate,
      hasHour,
      hasMinute,
      hasSecond,
      hasMeridiemField,
      _isChromeDateField,
    ] = this.timeCacher.getTimeParams(element);

    return Boolean(
      inputFieldCount === 4 &&
        !hasYear &&
        hasMonth &&
        hasDate &&
        hasHour &&
        hasMinute &&
        !hasSecond &&
        hasMeridiemField,
    );
  }
}
