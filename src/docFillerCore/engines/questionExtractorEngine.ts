export class QuestionExtractorEngine {
  /**
   * Returns an array of validated DOM elements representing questions in a Google Form.
   * @returns An array of validated question DOM elements.
   */
  public getValidQuestions(): HTMLElement[] {
    const questions = this.getQuestions();
    const validatedQuestions = this.validateQuestions(questions);
    return validatedQuestions;
  }

  /**
   * Retrieves all the question DOM elements from Google Forms.
   * Note: This may include false positives like checkboxes.
   * @returns A NodeList of DOM elements containing complete information for questions.
   */
  private getQuestions(): NodeListOf<HTMLElement> {
    return document.querySelectorAll('div[role=listitem]');
  }

  /**
   * Filters out invalid questions from the NodeList.
   * This method removes checkboxes, videos, images, and section headings.
   * @param questions - The NodeList of DOM elements to be filtered.
   * @returns An array of valid question DOM elements.
   */
  private validateQuestions(questions: NodeListOf<HTMLElement>): HTMLElement[] {
    const filteredQuestions = Array.from(questions).filter(
      (question) => !this.isSectionHeading(question),
    );

    return Array.from(filteredQuestions).filter(
      (question) =>
        !this.isCheckBoxListItem(question) &&
        !this.isVideo(question) &&
        !this.isImage(question) &&
        !this.isSectionItem(question),
    );
  }

  /**
   * Checks if the given DOM element is a checkbox list item.
   * @param element - The DOM element to be checked.
   * @returns True if the element is a checkbox list item, false otherwise.
   */
  private isCheckBoxListItem(element: HTMLElement): boolean {
    let hasListRole = false;
    let parentElement: HTMLElement | null = element.parentElement;

    while (parentElement && !hasListRole) {
      if (parentElement.getAttribute('role') === 'listitem') {
        hasListRole = true;
      }
      parentElement = parentElement.parentElement;
    }
    return hasListRole;
  }

  /**
   * Checks if the given DOM element is a section item.
   * @param element - The DOM element to be checked.
   * @returns True if the element is a section item, false otherwise.
   */
  private isSectionItem(element: HTMLElement): boolean {
    return Boolean(
      !element.querySelector(
        'img,iframe,input,div[role=checkbox],div[role=radio],div[role=listbox]',
      ) &&
        element.childElementCount > 0 &&
        element.childNodes?.[0]?.childNodes &&
        element.childNodes[0].childNodes.length > 1,
    );
  }

  /**
   * Checks if the given DOM element contains a video (particularly YouTube).
   * @param element - The DOM element to be checked.
   * @returns True if the element contains a video, false otherwise.
   */
  private isVideo(element: HTMLElement): boolean {
    return Boolean(element.querySelector('iframe'));
  }

  /**
   * Checks if the given DOM element is an image section.
   * @param element - The DOM element to be checked.
   * @returns True if the element is an image section, false otherwise.
   */
  private isImage(element: HTMLElement): boolean {
    return Boolean(
      element.querySelector('img') &&
        element.childElementCount > 0 &&
        element.childNodes?.[0]?.childNodes &&
        element.childNodes[0].childNodes.length > 1,
    );
  }

  /**
   * Checks if the given DOM element is a section heading in a Google Form.
   * @param divNode - The DOM element to be checked.
   * @returns True if the element is a section heading, false otherwise.
   */
  private isSectionHeading(divNode: HTMLElement): boolean {
    const attributes = divNode.firstChild as HTMLElement | null;

    try {
      return (
        attributes?.attributes.getNamedItem('role')?.nodeValue === 'heading'
      );
    } catch (_error) {
      return false;
    }
  }
}
