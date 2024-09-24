import { ChangeDetectionStrategy, Component, computed, effect, forwardRef, inject, input, OnDestroy, OnInit } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { Subject, takeUntil } from 'rxjs';

type TValueInput = string | null;
type TFormControlNameInput = string | null;

@Component({
  selector: 'custom-name-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div>
      <label for="nameInput">Name: </label>
      <input id="nameInput" [formControl]="formControl" placeholder="Name">
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CustomNameInput)
    }
  ]
})
export class CustomNameInput implements OnInit, OnDestroy, ControlValueAccessor {
  value = input<TValueInput>(null);
  formControlName = input<TFormControlNameInput>(null);
  disabled = input<boolean>(false);
  touched = computed(() => this.formControl?.touched ?? false);

  formControl!: FormControl<TValueInput>;

  private readonly controlContainer = inject(ControlContainer, { skipSelf: true, optional: true, host: true  });
  private readonly destroy$ = new Subject<void>();

  constructor() {
    effect(() => {
      if (this.formControl) {
        const isDisabled = this.disabled();
        isDisabled ? this.formControl.disable() : this.formControl.enable();
      }
    })
  }

  ngOnInit(): void {
    if (this.isReactiveForm()) {
      this.handleReactiveForom();
    } else {
      this.handleTemplateDrivenForm();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.isReactiveForm()) {
      const parentFormGroup = this.controlContainer?.control as FormGroup;
      if (this.formHasControl(parentFormGroup)) {
        parentFormGroup.removeControl(this.formControlName() as string);
      }
    }
  }

  onChange: (value: TValueInput) => void = () => {};
  onTouched: () => void = () => {};

  registerOnChange(fn: (value: TValueInput) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: TValueInput): void {
    if (this.formControl && !this.isReactiveForm()) {
      this.onChange(value);
      this.formControl.setValue(value);
    }
  }

  markAsTouched(): void {
    if (this.formControl && !this.touched()) {
      this.onTouched();
      this.formControl.markAsTouched();
    }
  }

  private isReactiveForm(): boolean {
    return !!(this.formControlName() && this.controlContainer && this.controlContainer.control instanceof FormGroup);
  }

  private formHasControl(form: FormGroup): boolean {
    return !!(this.formControlName() && form.contains(this.formControlName() as string));
  }

  /** Reactive form [formControlName] */
  private handleReactiveForom() {
    const parentFormGroup = this.controlContainer?.control as FormGroup;

    if (this.formHasControl(parentFormGroup)) {
      // The control is pre-configured - this is the angular default behavior
      this.formControl = parentFormGroup.get(this.formControlName() as string) as FormControl<TValueInput>;
    } else {
      // The control is pre-configured - this is the new dynamic behavior
      this.formControl = new FormControl(this.value() ?? null);
      // this is needed if we add controls dynamically and form is already set to "disabled" state
      // otherwise a new control will change disabled state of the form to valid/invalid
      if (parentFormGroup.status === 'DISABLED') {
        this.formControl.disable();
      }
      parentFormGroup.addControl(this.formControlName() as string, this.formControl);
    }
  }

  /** Template driven form [(ngModel)] */
  private handleTemplateDrivenForm() {
    this.formControl = new FormControl(this.value() ?? null);
    this.formControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => this.onChange(value));
  }
}
