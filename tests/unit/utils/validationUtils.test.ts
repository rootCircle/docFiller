import { describe, it, expect, beforeEach } from 'vitest';
import ValidationUtils from '@utils/validationUtils';

describe('ValidationUtils', () => {
  let validator: ValidationUtils;

  beforeEach(() => {
    validator = new ValidationUtils();
  });

  describe('validateDate', () => {
    describe('Valid dates', () => {
      it('should accept valid date in a normal month', () => {
        expect(validator.validateDate('15', '03', '2024')).toBe(true);
      });

      it('should accept first day of month', () => {
        expect(validator.validateDate('01', '01', '2024')).toBe(true);
      });

      it('should accept last day of 31-day month', () => {
        expect(validator.validateDate('31', '01', '2024')).toBe(true);
        expect(validator.validateDate('31', '03', '2024')).toBe(true);
        expect(validator.validateDate('31', '05', '2024')).toBe(true);
        expect(validator.validateDate('31', '07', '2024')).toBe(true);
        expect(validator.validateDate('31', '08', '2024')).toBe(true);
        expect(validator.validateDate('31', '10', '2024')).toBe(true);
        expect(validator.validateDate('31', '12', '2024')).toBe(true);
      });

      it('should accept 30th day of 30-day months', () => {
        expect(validator.validateDate('30', '04', '2024')).toBe(true);
        expect(validator.validateDate('30', '06', '2024')).toBe(true);
        expect(validator.validateDate('30', '09', '2024')).toBe(true);
        expect(validator.validateDate('30', '11', '2024')).toBe(true);
      });

      it('should accept Feb 29 on leap year', () => {
        expect(validator.validateDate('29', '02', '2024')).toBe(true);
        expect(validator.validateDate('29', '02', '2020')).toBe(true);
        expect(validator.validateDate('29', '02', '2000')).toBe(true);
      });

      it('should accept Feb 28 on any year', () => {
        expect(validator.validateDate('28', '02', '2024')).toBe(true);
        expect(validator.validateDate('28', '02', '2023')).toBe(true);
      });

      it('should use default leap year (2020) when year not provided', () => {
        expect(validator.validateDate('29', '02')).toBe(true);
      });
    });

    describe('Invalid dates', () => {
      it('should reject 31st day of 30-day months', () => {
        expect(validator.validateDate('31', '04', '2024')).toBe(false);
        expect(validator.validateDate('31', '06', '2024')).toBe(false);
        expect(validator.validateDate('31', '09', '2024')).toBe(false);
        expect(validator.validateDate('31', '11', '2024')).toBe(false);
      });

      it('should reject Feb 30', () => {
        expect(validator.validateDate('30', '02', '2024')).toBe(false);
      });

      it('should reject Feb 31', () => {
        expect(validator.validateDate('31', '02', '2024')).toBe(false);
      });

      it('should reject Feb 29 on non-leap year', () => {
        expect(validator.validateDate('29', '02', '2023')).toBe(false);
        expect(validator.validateDate('29', '02', '2021')).toBe(false);
        expect(validator.validateDate('29', '02', '2022')).toBe(false);
      });

      it('should reject Feb 29 on century non-leap years', () => {
        expect(validator.validateDate('29', '02', '1900')).toBe(false);
        expect(validator.validateDate('29', '02', '2100')).toBe(false);
      });

      it('should accept Feb 29 on 400-divisible years', () => {
        expect(validator.validateDate('29', '02', '2000')).toBe(true);
        expect(validator.validateDate('29', '02', '2400')).toBe(true);
      });

      it('should reject invalid day format', () => {
        expect(validator.validateDate('00', '05', '2024')).toBe(false);
        expect(validator.validateDate('32', '05', '2024')).toBe(false);
        expect(validator.validateDate('99', '05', '2024')).toBe(false);
      });

      it('should reject invalid month format', () => {
        expect(validator.validateDate('15', '00', '2024')).toBe(false);
        expect(validator.validateDate('15', '13', '2024')).toBe(false);
        expect(validator.validateDate('15', '99', '2024')).toBe(false);
      });

      it('should reject missing parameters', () => {
        expect(validator.validateDate('', '05', '2024')).toBe(false);
        expect(validator.validateDate('15', '', '2024')).toBe(false);
        expect(validator.validateDate('', '', '2024')).toBe(false);
      });

      it('should reject non-numeric day', () => {
        expect(validator.validateDate('1a', '05', '2024')).toBe(false);
        expect(validator.validateDate('ab', '05', '2024')).toBe(false);
      });

      it('should reject non-numeric month', () => {
        expect(validator.validateDate('15', 'ab', '2024')).toBe(false);
        expect(validator.validateDate('15', '1a', '2024')).toBe(false);
      });

      it('should reject non-numeric year', () => {
        expect(validator.validateDate('15', '05', 'abcd')).toBe(false);
        expect(validator.validateDate('15', '05', '20ab')).toBe(false);
      });

      it('should reject single digit day without leading zero', () => {
        expect(validator.validateDate('5', '05', '2024')).toBe(false);
      });

      it('should reject single digit month without leading zero', () => {
        expect(validator.validateDate('15', '5', '2024')).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should handle boundary days correctly', () => {
        // First and last valid days of each month type
        expect(validator.validateDate('01', '01', '2024')).toBe(true);
        expect(validator.validateDate('31', '12', '2024')).toBe(true);
      });

      it('should handle all 31-day months correctly', () => {
        const months31 = ['01', '03', '05', '07', '08', '10', '12'];
        for (const month of months31) {
          expect(validator.validateDate('31', month, '2024')).toBe(true);
        }
      });

      it('should handle all 30-day months correctly', () => {
        const months30 = ['04', '06', '09', '11'];
        for (const month of months30) {
          expect(validator.validateDate('30', month, '2024')).toBe(true);
          expect(validator.validateDate('31', month, '2024')).toBe(false);
        }
      });

      it('should validate all days in February for leap year', () => {
        for (let day = 1; day <= 29; day++) {
          const dayStr = day.toString().padStart(2, '0');
          expect(validator.validateDate(dayStr, '02', '2024')).toBe(true);
        }
      });

      it('should validate all days in February for non-leap year', () => {
        for (let day = 1; day <= 28; day++) {
          const dayStr = day.toString().padStart(2, '0');
          expect(validator.validateDate(dayStr, '02', '2023')).toBe(true);
        }
        expect(validator.validateDate('29', '02', '2023')).toBe(false);
      });
    });
  });
});



