import { QType } from '@utils/questionTypes';

export class PrefilledChecker {
  public markedCheck(fieldType: QType, fieldValue: ExtractedValue): boolean {
    try {
      switch (fieldType) {
        case QType.TEXT:
          return this.isTextFilled(fieldValue);

        case QType.PARAGRAPH:
          return this.isParagraphFilled(fieldValue);

        case QType.TEXT_EMAIL:
          return this.isTextEmailFilled(fieldValue);

        case QType.TEXT_URL:
          return this.isTextUrlFilled(fieldValue);

        case QType.MULTI_CORRECT:
          return this.isMultiCorrectFilled(fieldValue);

        case QType.MULTI_CORRECT_WITH_OTHER:
          return this.isMultiCorrectWithOtherFilled(fieldValue);

        case QType.MULTIPLE_CHOICE:
          return this.isMultipleChoiceFilled(fieldValue);

        case QType.MULTIPLE_CHOICE_WITH_OTHER:
          return this.isMultipleChoiceWithOtherFilled(fieldValue);

        case QType.MULTIPLE_CHOICE_GRID:
          return this.isMultipleChoiceGridFilled(fieldValue);

        case QType.CHECKBOX_GRID:
          return this.isCheckboxGridFilled(fieldValue);

        case QType.LINEAR_SCALE_OR_STAR:
          return this.isLinearScaleFilled(fieldValue);

        case QType.DROPDOWN:
          return this.isDropdownFilled(fieldValue);

        case QType.DATE:
          return this.isDateFilled(fieldValue);

        case QType.DATE_WITHOUT_YEAR:
          return this.isDateWithoutYearFilled(fieldValue);

        case QType.TIME:
          return this.isTimeFilled(fieldValue);

        case QType.TIME_WITH_MERIDIEM:
          //No need to check meridiem field as it has a default value in google form so it will always be filled.
          return this.isTimeWithMeridiemFilled(fieldValue);

        case QType.DURATION:
          return this.isDurationFilled(fieldValue);

        case QType.DATE_AND_TIME:
          return this.isDateAndTimeFilled(fieldValue);

        case QType.DATE_TIME_WITH_MERIDIEM:
          //No need to check meridiem field as it has a default value in google form so it will always be filled.
          return this.isDateTimeWithMeridiemFilled(fieldValue);

        case QType.DATE_TIME_WITHOUT_YEAR:
          return this.isDateTimeWithoutYearFilled(fieldValue);

        case QType.DATE_TIME_WITH_MERIDIEM_WITHOUT_YEAR:
          //No need to check meridiem field as it has a default value in google form so it will always be filled.
          return this.isDateTimeWithMeridiemWithoutYearFilled(fieldValue);
      }
    } catch (e) {
      // biome-ignore lint/suspicious/noConsole: debugging error in prefilled checker
      console.error('Error checking if field is filled:', e);
      return false;
    }
  }

  private isTextFilled(fieldValue: ExtractedValue): boolean {
    return (fieldValue.dom as HTMLInputElement)?.value?.trim().length > 0;
  }

  private isParagraphFilled(fieldValue: ExtractedValue): boolean {
    return this.isTextFilled(fieldValue);
  }

  private isTextEmailFilled(fieldValue: ExtractedValue): boolean {
    return this.isTextFilled(fieldValue);
  }

  private isTextUrlFilled(fieldValue: ExtractedValue): boolean {
    return this.isTextFilled(fieldValue);
  }

  private isMultiCorrectFilled(fieldValue: ExtractedValue): boolean {
    return (
      fieldValue.options?.some(
        (opt) => opt.dom?.getAttribute('aria-checked') === 'true',
      ) || false
    );
  }

  private isMultiCorrectWithOtherFilled(fieldValue: ExtractedValue): boolean {
    const hasCheckedOption = this.isMultiCorrectFilled(fieldValue);
    const hasCheckedOther =
      fieldValue.other?.dom?.getAttribute('aria-checked') === 'true' &&
      fieldValue.other?.inputBoxDom?.value?.trim().length > 0;

    return hasCheckedOption || hasCheckedOther;
  }

  private isMultipleChoiceFilled(fieldValue: ExtractedValue): boolean {
    return this.isMultiCorrectFilled(fieldValue);
  }

  private isMultipleChoiceWithOtherFilled(fieldValue: ExtractedValue): boolean {
    return this.isMultiCorrectWithOtherFilled(fieldValue);
  }

  private isMultipleChoiceGridFilled(fieldValue: ExtractedValue): boolean {
    if (!fieldValue.rowColumnOption) {
      return false;
    }
    return fieldValue.rowColumnOption.every((row) => {
      const markedCount = row.cols.filter(
        (col) => col.dom?.getAttribute('aria-checked') === 'true',
      ).length;
      return markedCount === 1;
    });
  }

  private isCheckboxGridFilled(fieldValue: ExtractedValue): boolean {
    if (!fieldValue.rowColumnOption) {
      return false;
    }
    return fieldValue.rowColumnOption.every((row) => {
      const markedCount = row.cols.filter((col) =>
        col.dom?.querySelector('div[role=checkbox][aria-checked=true]'),
      ).length;
      return markedCount > 0;
    });
  }

  private isLinearScaleFilled(fieldValue: ExtractedValue): boolean {
    return (
      fieldValue.options?.some(
        (opt) => opt.dom?.getAttribute('aria-checked') === 'true',
      ) || false
    );
  }

  private isDropdownFilled(fieldValue: ExtractedValue): boolean {
    return (
      fieldValue.dom
        ?.querySelector('[aria-selected="true"]')
        ?.getAttribute('data-value') !== ''
    );
  }

  private isDateFilled(fieldValue: ExtractedValue): boolean {
    return Boolean(
      fieldValue.date?.value &&
        fieldValue.month?.value &&
        fieldValue.year?.value,
    );
  }

  private isDateWithoutYearFilled(fieldValue: ExtractedValue): boolean {
    return Boolean(fieldValue.date?.value && fieldValue.month?.value);
  }

  private isTimeFilled(fieldValue: ExtractedValue): boolean {
    return Boolean(fieldValue.hour?.value && fieldValue.minute?.value);
  }

  private isTimeWithMeridiemFilled(fieldValue: ExtractedValue): boolean {
    return this.isTimeFilled(fieldValue);
  }

  private isDurationFilled(fieldValue: ExtractedValue): boolean {
    return Boolean(
      fieldValue.hour?.value ||
        fieldValue.minute?.value ||
        fieldValue.second?.value,
    );
  }

  private isDateAndTimeFilled(fieldValue: ExtractedValue): boolean {
    return this.isDateFilled(fieldValue) && this.isTimeFilled(fieldValue);
  }

  private isDateTimeWithMeridiemFilled(fieldValue: ExtractedValue): boolean {
    return this.isDateAndTimeFilled(fieldValue);
  }

  private isDateTimeWithoutYearFilled(fieldValue: ExtractedValue): boolean {
    return (
      this.isDateWithoutYearFilled(fieldValue) && this.isTimeFilled(fieldValue)
    );
  }

  private isDateTimeWithMeridiemWithoutYearFilled(
    fieldValue: ExtractedValue,
  ): boolean {
    return this.isDateTimeWithoutYearFilled(fieldValue);
  }
}
