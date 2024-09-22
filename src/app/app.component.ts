import { Component, forwardRef, inject, input, OnInit } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";
import { RouterOutlet } from '@angular/router';

type TNameInput = string | null;

@Component({
  selector: 'custom-name-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div>
      <label for="nameInput">Name:</label>
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
export class CustomNameInput implements OnInit, ControlValueAccessor {
  value = input<TNameInput>(null);
  formControlName = input<TNameInput>(null);

  formControl!: FormControl;

  protected controlContainer = inject(ControlContainer, { skipSelf: true, optional: true, host: true  });

  get touched(): boolean {
    return this.formControl.touched;
  }

  get disabled(): boolean {
    return this.formControl.disabled;
  }

  ngOnInit(): void {
    this.formControl = new FormControl(this.value());

    if (this.controlContainer && this.controlContainer.control instanceof FormGroup) {
      const parentFormGroup = this.controlContainer.control as FormGroup;
      const controlName = this.formControlName();
      if (controlName&& !parentFormGroup.contains(controlName)) {
        parentFormGroup.addControl(controlName, this.formControl);
      }
    }
  }

  onChange: (value: TNameInput) => void = () => {};
  onTouched: () => void = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  writeValue(value: TNameInput): void {
    this.formControl.setValue(value);
  }

  markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.formControl.markAsTouched();
    }
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CustomNameInput, ReactiveFormsModule],
  template: `
    <h2>NG Playgroud</h2>
    <hr>
    <form [formGroup]="form">
      <custom-name-input formControlName="my-name"></custom-name-input>
    </form>
    <div>
      <button (click)="onToggleButtonClick()">enable/disable</button>
    </div>
  `
})
export class AppComponent implements OnInit {
  form = new FormGroup({ id: new FormControl('my-form') });

  ngOnInit(): void {
    this.form.statusChanges.subscribe(status => console.log('statusChanges', status));
    this.form.valueChanges.subscribe(value => console.log('valueChanges', value));
  }

  onToggleButtonClick() {
    if (!this.form.disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }
}
