/**
 * This module provides types and functionality to interact with common data used
 * by both the front-end and back-end.
 */

 /**
  * This data type is used by Django to define a set of choices for a form or
  * model field. The first string is the machine-readable value of the field that
  * is used in data serialization, while the second string is the human-readable
  * label.
  * 
  * For more details, see:
  * 
  *   https://docs.djangoproject.com/en/2.1/ref/models/fields/#choices
  */
export type DjangoChoice = [string, string];

export type DjangoChoices = DjangoChoice[];


/** Retrieve the human-readable label for a choice, given its machine-readable value. */
export function getDjangoChoiceLabel(choices: DjangoChoices, value: string): string {
  for (let [v, label] of choices) {
    if (v === value) return label;
  }
  throw new Error(`Unable to find label for value ${value}`);
}