import { Directive, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { BaseComponent } from './base.component';

@Directive()
export abstract class BaseFormComponent<TForm extends FormGroup = FormGroup>
  extends BaseComponent {
  readonly submitted = signal(false);

  abstract form: TForm;

  get isInvalid(): boolean {
    return this.form.invalid && this.submitted();
  }

  protected submitForm(): boolean {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    return this.form.valid;
  }

  protected resetForm(): void {
    this.submitted.set(false);
    this.form.reset();
  }

  protected isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.touched || this.submitted())
    );
  }

  protected getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);

    if (!field || !field.errors) return null;

    if (field.errors['required']) {
      return 'This field is required';
    }

    if (field.errors['email']) {
      return 'Enter a valid email address';
    }

    if (field.errors['minlength']) {
      return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
    }

    if (field.errors['maxlength']) {
      return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
    }

    if (field.errors['pattern']) {
      return 'Invalid format';
    }

    return 'Invalid value';
  }
}