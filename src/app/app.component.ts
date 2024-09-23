import { AfterViewInit, Component, forwardRef, inject, Input, input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormGroup, FormsModule, NG_VALUE_ACCESSOR, NgForm, ReactiveFormsModule } from "@angular/forms";
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

type TValueInput = string | null;
type TFormControlInput = string | null;

@Component({
  selector: 'custom-name-input',
  standalone: true,
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
  formControlName = input<TFormControlInput>(null);

  formControl!: FormControl;

  get touched(): boolean {
    return this.formControl?.touched ?? false;
  }

  get disabled(): boolean {
    return this.formControl?.disabled ?? false;
  }

  @Input() set disabled(value: boolean) {
    if (this.formControl) {
      value ? this.formControl.disable() : this.formControl.enable();
    }
  }

  private readonly controlContainer = inject(ControlContainer, { skipSelf: true, optional: true, host: true  });
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.formControl = new FormControl(this.value() ?? null);

    if (this.isReactiveForm()) {
      const parentFormGroup = this.controlContainer?.control as FormGroup;
      if (!this.formHasControl(parentFormGroup)) {
        parentFormGroup.addControl(this.formControlName() as string, this.formControl);
      }
    } else {
      this.formControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => this.onChange(value));
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
    if (this.formControl) {
      this.onChange(value);
      this.formControl.setValue(value);
    }
  }

  markAsTouched(): void {
    if (this.formControl && !this.touched) {
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
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CustomNameInput, ReactiveFormsModule, FormsModule],
  template: `
    <h2>NG Playgroud</h2>
    <hr>
    <h3>Reactive Form</h3>
    <form [formGroup]="reactiveForm">
      <custom-name-input formControlName="my-name"></custom-name-input>
    </form>
    <div style="margin-top: 10px;">
      <button (click)="onToggleReactiveFormDisabled()">enable/disable</button>
    </div>
    <h3>Template driven Form</h3>
    <form #myForm="ngForm">
      <custom-name-input name="my-name" [(ngModel)]="nameValue" [disabled]="nameDisabled"></custom-name-input>
    </form>
    <div style="margin-top: 10px;">
      <button (click)="onToggleTemplateFormDisabled()">enable/disable</button>
    </div>
  `
})
export class AppComponent implements OnInit, AfterViewInit {
  reactiveForm = new FormGroup({ id: new FormControl('my-form') });

  @ViewChild('myForm') templateForm!: NgForm;

  nameValue = 'Max Mustermann';
  nameDisabled = false;

  ngOnInit(): void {
    this.reactiveForm.statusChanges.subscribe(status => console.log('ReactiveForm statusChanges', status));
    this.reactiveForm.valueChanges.subscribe(value => console.log('ReactiveForm valueChanges', value));
  }

  ngAfterViewInit(): void {
    this.templateForm?.statusChanges?.subscribe(status => console.log('TemplateForm statusChanges', status));
    this.templateForm?.valueChanges?.subscribe(value => console.log('TemplateForm valueChanges', value));
  }

  onToggleReactiveFormDisabled() {
    this.reactiveForm.disabled ? this.reactiveForm.enable() : this.reactiveForm.enable();
  }

  onToggleTemplateFormDisabled() {
    this.nameDisabled = !this.nameDisabled;
  }
}
