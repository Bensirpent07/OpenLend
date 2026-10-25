import { Component, inject, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonDirective } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CreateCatalogItemRequest } from '../../dto/create-catalog-item-request';
import { CatalogService } from '../../services/catalog-service';
import { finalize } from 'rxjs';
import { LucideLoaderCircle } from '@lucide/angular';

@Component({
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonDirective,
    InputTextModule,
    TextareaModule,
    LucideLoaderCircle
  ],
  selector: 'app-create-catalog-item-dialog',
  styleUrl: './create-catalog-item-dialog.scss',
  templateUrl: './create-catalog-item-dialog.html',
})
export class CreateCatalogItemDialog {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly catalogService = inject(CatalogService);
  public readonly visible = model(false);
  public readonly created = output();
  public readonly processing = signal(false);
  public readonly errorMessage = signal('');

  public readonly form = this.fb.group({
    name: this.fb.control<string>('', {
      validators: [
        (control) => Validators.required(control),
        Validators.pattern(/\S/),
        Validators.maxLength(200),
      ],
    }),
    description: this.fb.control<string>('', { validators: Validators.maxLength(2000) }),
  });

  public submit(): void{
    if(this.form.invalid || this.processing()) return;
    this.processing.set(true);
    this.errorMessage.set('');

    const request: CreateCatalogItemRequest = {
      name: this.form.controls.name.value,
      description: this.form.controls.description.value
    }

    this.catalogService.createCatalogItem(request)
    .pipe(finalize(() => { this.processing.set(false); }))
    .subscribe({
      next: () => {
        this.closeAndResetForm();
        this.created.emit();
      },
      error: () => {
        this.errorMessage.set('Unable to process request.');
      }
    });
  }

  public closeAndResetForm(): void{
    this.visible.set(false);
    this.form.reset();
    this.errorMessage.set('');
  }
}
