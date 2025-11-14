import { afterEach, describe, expect, it } from 'vitest';

import { QuestionExtractorEngine } from '@docFillerCore/engines/questionExtractorEngine';

const createQuestion = (content: HTMLElement): HTMLElement => {
  const question = document.createElement('div');
  question.setAttribute('role', 'listitem');
  question.appendChild(content);
  document.body.appendChild(question);
  return question;
};

describe('QuestionExtractorEngine', () => {
  const extractor = new QuestionExtractorEngine();

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns only valid question elements', () => {
    const inputWrapper = document.createElement('div');
    const input = document.createElement('input');
    inputWrapper.appendChild(input);
    const validQuestion = createQuestion(inputWrapper);

    const results = extractor.getValidQuestions();
    expect(results).toEqual([validQuestion]);
  });

  it('filters out section headings', () => {
    const headingQuestion = document.createElement('div');
    const headingContainer = document.createElement('div');
    headingContainer.setAttribute('role', 'heading');
    headingQuestion.appendChild(headingContainer);
    document.body.appendChild(headingQuestion);

    const results = extractor.getValidQuestions();
    expect(results).toHaveLength(0);
  });

  it('filters out nested checkbox list items', () => {
    const parentQuestion = document.createElement('div');
    parentQuestion.setAttribute('role', 'listitem');
    const nestedListItem = document.createElement('div');
    nestedListItem.setAttribute('role', 'listitem');
    const checkbox = document.createElement('div');
    checkbox.setAttribute('role', 'checkbox');
    nestedListItem.appendChild(checkbox);
    parentQuestion.appendChild(nestedListItem);
    document.body.appendChild(parentQuestion);

    const results = extractor.getValidQuestions();
    expect(results).toEqual([parentQuestion]);
  });

  it('filters out questions that contain video iframes', () => {
    const videoQuestion = document.createElement('div');
    const iframe = document.createElement('iframe');
    videoQuestion.appendChild(iframe);
    document.body.appendChild(videoQuestion);

    const results = extractor.getValidQuestions();
    expect(results).toHaveLength(0);
  });

  it('filters out image sections without inputs', () => {
    const imageQuestion = document.createElement('div');
    const wrapper = document.createElement('div');
    const innerWrapper = document.createElement('div');
    const image = document.createElement('img');
    innerWrapper.appendChild(image);
    wrapper.appendChild(innerWrapper);
    wrapper.appendChild(document.createElement('span'));
    imageQuestion.appendChild(wrapper);
    document.body.appendChild(imageQuestion);

    const results = extractor.getValidQuestions();
    expect(results).toHaveLength(0);
  });

  it('excludes section items while keeping field questions', () => {
    const sectionItem = document.createElement('div');
    const sectionWrapper = document.createElement('div');
    sectionWrapper.appendChild(document.createElement('p'));
    sectionWrapper.appendChild(document.createElement('span'));
    sectionItem.appendChild(sectionWrapper);
    document.body.appendChild(sectionItem);

    const inputWrapper = document.createElement('div');
    const input = document.createElement('input');
    inputWrapper.appendChild(input);
    const validQuestion = createQuestion(inputWrapper);

    const results = extractor.getValidQuestions();
    expect(results).toEqual([validQuestion]);
  });
});

