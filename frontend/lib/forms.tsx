import React from 'react';

/**
 * This is the form validation error type returned from the server.
 */
interface FormFieldError {
  field: string;
  messages: string[];
}

// This type is parameterized by the form input, so that each
// key corresponds to the name of a form input field.
export type FormFieldErrorMap<T> = {
  [K in keyof T]?: string[];
}

export interface FormErrors<T> {
  /**
   * Non-field errors that don't correspond to any particular field.
   */
  nonFieldErrors: string[];

  /**
   * Field-specific errors.
   */
  fieldErrors: FormFieldErrorMap<T>;
}

/**
 * Re-structure a list of errors from the server into a more convenient
 * format for us to process.
 * 
 * @param errors A list of errors from the server.
 */
export function getFormErrors<T>(errors: FormFieldError[]): FormErrors<T> {
  const result: FormErrors<T> = {
    nonFieldErrors: [],
    fieldErrors: {}
  };

  errors.forEach(error => {
    if (error.field === '__all__') {
      result.nonFieldErrors.push(...error.messages);
    } else {
      // Note that we're forcing a typecast here. It's not ideal, but
      // it seems better than the alternative of not parameterizing
      // this type at all.
      const field: keyof T = error.field as any;

      // This code looks weird because TypeScript is being fidgety.
      const arr = result.fieldErrors[field];
      if (arr) {
        arr.push(...error.messages);
      } else {
        result.fieldErrors[field] = [...error.messages];
      }
    }
  });

  return result;
}

/** A simple JSX component that displays some errors. */
export function ListFieldErrors({ errors }: { errors: string[]|undefined }): JSX.Element|null {
  if (!errors) {
    return null;
  }

  return (
    <ul>
      {errors.map(error => <li key={error}>{error}</li>)}
    </ul>
  );
}

/**
 * Base properties that form fields need to have.
 */
export interface BaseFormFieldProps<T> {
  onChange: (value: T) => void;
  errors?: string[];
  value: T;
}

/**
 * Valid types of textual form field input.
 */
export type TextualInputType = 'text'|'password';

/**
 * Properties for textual form field input.
 */
export interface TextualFormFieldProps extends BaseFormFieldProps<string> {
  type?: TextualInputType;
  label: string;
};

/** A JSX component for textual form input. */
export function TextualFormField(props: TextualFormFieldProps): JSX.Element {
  const type: TextualInputType = props.type || 'text';

  return (
    <div>
      <p>
        <input
          className="input"
          type={type}
          // TODO: This should really be a <label>, not a placeholder.
          placeholder={props.label}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      </p>
    <ListFieldErrors errors={props.errors} />
  </div>
  );
}
