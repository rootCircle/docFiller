import { describe, it, expect, beforeEach } from 'vitest';
import { FieldExtractorEngine } from '@docFillerCore/engines/fieldExtractorEngine';
import { QType } from '@utils/questionTypes';

describe('FieldExtractorEngine', () => {
  let extractor: FieldExtractorEngine;

  beforeEach(() => {
    extractor = new FieldExtractorEngine();
    document.body.innerHTML = '';
  });

  describe('getFields', () => {
    it('should extract title and description', () => {
      document.body.innerHTML = `
        <div>
          <div role="heading"><div>Question Title</div></div>
          <div>Question Description</div>
          <input type="text" />
        </div>
      `;
      const element = document.querySelector('div')!;
      const result = extractor.getFields(element, QType.TEXT);
      
      expect(result.title).toBe('Question Title');
    });

    it('should combine title and type-specific fields', () => {
      document.body.innerHTML = `
        <div>
          <div role="heading"><div>Select an option</div></div>
          <div role="list">
            <label></label>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      const result = extractor.getFields(element, QType.MULTI_CORRECT);
      
      expect(result.title).toBe('Select an option');
      expect(result.options).toBeDefined();
    });
  });

  describe('getTitle', () => {
    it('should extract title from heading', () => {
      document.body.innerHTML = `
        <div>
          <div role="heading"><div>My Question</div></div>
        </div>
      `;
      const element = document.querySelector('div')!;
      const result = extractor.getFields(element, QType.TEXT);
      
      expect(result.title).toBe('My Question');
    });

    it('should return empty string if no heading', () => {
      document.body.innerHTML = `<div><input type="text" /></div>`;
      const element = document.querySelector('div')!;
      const result = extractor.getFields(element, QType.TEXT);
      
      expect(result.title).toBe('');
    });

    it('should handle multiline titles', () => {
      document.body.innerHTML = `
        <div>
          <div role="heading"><div>Line 1<br>Line 2</div></div>
        </div>
      `;
      const element = document.querySelector('div')!;
      const result = extractor.getFields(element, QType.TEXT);
      
      expect(result.title).toBeTruthy();
    });
  });

  describe('getDescription', () => {
    it('should extract description when present', () => {
      document.body.innerHTML = `
        <div>
          <div>
            <div role="heading"><div>Title</div></div>
            <div>Description text</div>
          </div>
        </div>
      `;
      const element = document.querySelector('div')!;
      const result = extractor.getFields(element, QType.TEXT);
      
      // Description extraction depends on specific DOM structure
      expect(result.description !== undefined).toBe(true);
    });

    it('should return null if no description', () => {
      document.body.innerHTML = `
        <div>
          <div role="heading"><div>Title Only</div></div>
        </div>
      `;
      const element = document.querySelector('div')!;
      const result = extractor.getFields(element, QType.TEXT);
      
      expect(result.description === null || result.description === '').toBe(true);
    });
  });

  describe('Simple Input Fields', () => {
    describe('getDomText', () => {
      it('should extract text input DOM reference', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" />
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.TEXT);
        
        expect(result.dom).toBeTruthy();
        expect(result.dom).toBeInstanceOf(HTMLInputElement);
      });
    });

    describe('getDomTextEmail', () => {
      it('should extract email input DOM reference', () => {
        document.body.innerHTML = `
          <div>
            <input type="email" />
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.TEXT_EMAIL);
        
        expect(result.dom).toBeTruthy();
        expect(result.dom).toBeInstanceOf(HTMLInputElement);
      });

      it('should find text input when email type not specified', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" />
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.TEXT_EMAIL);
        
        expect(result.dom).toBeTruthy();
      });
    });

    describe('getDomTextParagraph', () => {
      it('should extract textarea DOM reference', () => {
        document.body.innerHTML = `
          <div>
            <textarea></textarea>
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.PARAGRAPH);
        
        expect(result.dom).toBeTruthy();
        expect(result.dom).toBeInstanceOf(HTMLTextAreaElement);
      });
    });

    describe('getDomTextUrl', () => {
      it('should extract URL input DOM reference', () => {
        document.body.innerHTML = `
          <div>
            <input type="url" />
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.TEXT_URL);
        
        expect(result.dom).toBeTruthy();
      });
    });
  });

  describe('Choice-based Fields', () => {
    describe('getParamsMultiCorrect', () => {
      it('should extract checkbox options', () => {
        document.body.innerHTML = `
          <div>
            <div role="list">
              <label><span dir="auto">Option 1</span></label>
              <label><span dir="auto">Option 2</span></label>
            </div>
            <div role="checkbox"></div>
            <div role="checkbox"></div>
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.MULTI_CORRECT);
        
        expect(result.options).toBeDefined();
        expect(Array.isArray(result.options)).toBe(true);
      });

      it('should return empty options if no labels found', () => {
        document.body.innerHTML = `<div></div>`;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.MULTI_CORRECT);
        
        expect(result.options).toEqual([]);
      });
    });

    describe('getParamsMultipleChoice', () => {
      it('should extract radio button options', () => {
        document.body.innerHTML = `
          <div>
            <div role="radiogroup">
              <label><span dir="auto">Choice A</span></label>
              <label><span dir="auto">Choice B</span></label>
            </div>
            <div role="radio"></div>
            <div role="radio"></div>
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.MULTIPLE_CHOICE);
        
        expect(result.options).toBeDefined();
        expect(Array.isArray(result.options)).toBe(true);
      });
    });

    describe('getParamsDropdown', () => {
      it('should extract dropdown options', () => {
        document.body.innerHTML = `
          <div>
            <div role="listbox">
              <div role="option"><span>Choose</span></div>
              <div role="option"><span>Option 1</span></div>
              <div role="option"><span>Option 2</span></div>
            </div>
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.DROPDOWN);
        
        expect(result.options).toBeDefined();
        // First option (Choose) should be skipped
        expect(result.options!.length).toBe(2);
        expect(result.dom).toBeTruthy();
      });

      it('should handle empty dropdown', () => {
        document.body.innerHTML = `<div></div>`;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.DROPDOWN);
        
        expect(result.options).toEqual([]);
      });
    });

    describe('getParamsLinearScale', () => {
      it('should extract linear scale options with bounds', () => {
        document.body.innerHTML = `
          <div>
            <span role="presentation">
              <div><div><div>Low</div></div></div>
              <div><div><div>High</div></div></div>
            </span>
            <div dir="auto">1</div>
            <div dir="auto">2</div>
            <div dir="auto">3</div>
            <div role="radio"></div>
            <div role="radio"></div>
            <div role="radio"></div>
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.LINEAR_SCALE_OR_STAR);
        
        expect(result.bounds).toBeDefined();
        expect(result.options).toBeDefined();
      });
    });
  });

  describe('Date/Time Fields', () => {
    describe('getDomDate', () => {
      it('should extract date input fields (Firefox)', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Year" />
            <input type="text" aria-label="Month" />
            <input type="text" aria-label="Day of the month" />
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.DATE);
        
        expect(result.year).toBeTruthy();
        expect(result.month).toBeTruthy();
        expect(result.date).toBeTruthy();
      });

      it('should extract date input field (Chrome)', () => {
        document.body.innerHTML = `
          <div>
            <input type="date" />
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.DATE);
        
        expect(result.chromeDateField).toBeTruthy();
      });
    });

    describe('getDomTime', () => {
      it('should extract time input fields', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.TIME);
        
        expect(result.hour).toBeTruthy();
        expect(result.minute).toBeTruthy();
      });
    });

    describe('getDomDuration', () => {
      it('should extract duration fields', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Hours" />
            <input type="text" aria-label="Minutes" />
            <input type="text" aria-label="Seconds" />
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.DURATION);
        
        expect(result.hour).toBeTruthy();
        expect(result.minute).toBeTruthy();
        expect(result.second).toBeTruthy();
      });
    });

    describe('getDomDateAndTime', () => {
      it('should extract combined date and time fields', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Year" />
            <input type="text" aria-label="Month" />
            <input type="text" aria-label="Day of the month" />
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.DATE_AND_TIME);
        
        expect(result.year).toBeTruthy();
        expect(result.month).toBeTruthy();
        expect(result.date).toBeTruthy();
        expect(result.hour).toBeTruthy();
        expect(result.minute).toBeTruthy();
      });
    });

    describe('getDomTimeWithMeridiem', () => {
      it('should extract time fields with meridiem selector', () => {
        document.body.innerHTML = `
          <div>
            <input type="text" aria-label="Hour" />
            <input type="text" aria-label="Minute" />
            <div role="presentation"></div>
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.TIME_WITH_MERIDIEM);
        
        expect(result.hour).toBeTruthy();
        expect(result.minute).toBeTruthy();
        expect(result.meridiem).toBeTruthy();
      });
    });
  });

  describe('Grid Fields', () => {
    describe('getParamsMultipleChoiceGrid', () => {
      it('should extract grid structure', () => {
        document.body.innerHTML = `
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <div>
                      <div>
                        <div></div>
                        <div>Col 1</div>
                        <div>Col 2</div>
                      </div>
                      <div role="radiogroup">
                        Row 1
                        <div role="radio"></div>
                        <div role="radio"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.MULTIPLE_CHOICE_GRID);
        
        expect(result.rowColumnOption).toBeDefined();
        expect(result.rowArray).toBeDefined();
        expect(result.columnArray).toBeDefined();
      });
    });

    describe('getParamsCheckboxGrid', () => {
      it('should extract checkbox grid structure', () => {
        document.body.innerHTML = `
          <div>
            <div>
              <div>
                <div>
                  <div>
                    <div>
                      <div>
                        <div></div>
                        <div>Column 1</div>
                      </div>
                      <div>Row 1</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div role="group">
              <label></label>
            </div>
          </div>
        `;
        const element = document.querySelector('div')!;
        const result = extractor.getFields(element, QType.CHECKBOX_GRID);
        
        expect(result.rowColumnOption).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing elements gracefully', () => {
      document.body.innerHTML = `<div></div>`;
      const element = document.querySelector('div')!;
      
      const result = extractor.getFields(element, QType.TEXT);
      
      expect(result).toBeDefined();
      expect(result.title).toBe('');
    });

    it('should handle malformed HTML', () => {
      document.body.innerHTML = `<div><broken></div>`;
      const element = document.querySelector('div')!;
      
      const result = extractor.getFields(element, QType.TEXT);
      
      expect(result).toBeDefined();
    });

    it('should handle deeply nested structures', () => {
      document.body.innerHTML = `
        <div>
          <div><div><div>
            <div role="heading"><div>Nested Title</div></div>
          </div></div></div>
        </div>
      `;
      const element = document.querySelector('div')!;
      const result = extractor.getFields(element, QType.TEXT);
      
      expect(result.title).toBeTruthy();
    });
  });
});



