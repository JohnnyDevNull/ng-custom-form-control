import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule } from "@angular/forms";
import { RouterOutlet } from '@angular/router';
import { CustomNameInput } from './components/custom-name-input.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CustomNameInput, ReactiveFormsModule, FormsModule],
  template: `
    <h2>NG Playgroud</h2>
    <hr>
    <h3>Reactive Form - self adding</h3>
    <form [formGroup]="reactiveForm">
      <custom-name-input formControlName="my-name" value="some preset"></custom-name-input>
    </form>
    <div style="margin-top: 10px;">
      <button (click)="onToggleReactiveFormDisabled()">enable/disable</button>
    </div>
    <h3>Reactive Form - pre-defined</h3>
    <form [formGroup]="reactiveForm2">
      <custom-name-input formControlName="my-name-2"></custom-name-input>
    </form>
    <div style="margin-top: 10px;">
      <button (click)="onToggleReactiveForm2Disabled()">enable/disable</button>
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
  reactiveForm2 = new FormGroup({ id: new FormControl('my-form-2'), 'my-name-2': new FormControl('some pre-defined preset') });

  @ViewChild('myForm') templateForm!: NgForm;

  nameValue = 'Max Mustermann';
  nameDisabled = false;

  ngOnInit(): void {
    this.reactiveForm.statusChanges.subscribe(status => console.log('ReactiveForm statusChanges', status));
    this.reactiveForm.valueChanges.subscribe(value => console.log('ReactiveForm valueChanges', value));
    this.reactiveForm2.statusChanges.subscribe(status => console.log('ReactiveForm2 statusChanges', status));
    this.reactiveForm2.valueChanges.subscribe(value => console.log('ReactiveForm2 valueChanges', value));
  }

  ngAfterViewInit(): void {
    this.templateForm?.statusChanges?.subscribe(status => console.log('TemplateForm statusChanges', status));
    this.templateForm?.valueChanges?.subscribe(value => console.log('TemplateForm valueChanges', value));
  }

  onToggleReactiveFormDisabled() {
    this.reactiveForm.disabled ? this.reactiveForm.enable() : this.reactiveForm.disable();
  }

  onToggleReactiveForm2Disabled() {
    this.reactiveForm2.disabled ? this.reactiveForm2.enable() : this.reactiveForm2.disable();
  }

  onToggleTemplateFormDisabled() {
    this.nameDisabled = !this.nameDisabled;
  }
}
