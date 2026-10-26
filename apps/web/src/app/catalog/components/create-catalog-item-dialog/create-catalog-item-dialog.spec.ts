import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCatalogItemDialog } from './create-catalog-item-dialog';
import { Mocked } from 'vitest';
import { CatalogService } from '../../services/catalog-service';
import { CreateCatalogItemRequest } from '../../dto/create-catalog-item-request';
import { of, Subject } from 'rxjs';
import { CatalogItem } from '../../models/catalog-item';

describe('CreateCatalogItemDialog', () => {
  let component: CreateCatalogItemDialog;
  let fixture: ComponentFixture<CreateCatalogItemDialog>;
  let catalogServiceStub: Mocked<Pick<CatalogService, 'createCatalogItem'>>;

  beforeEach(async () => {
    catalogServiceStub = {
      createCatalogItem: vi.fn<CatalogService['createCatalogItem']>().mockReturnValue(of({
        id: '0192f7d6-12ab-7000-8000-000000000001',
        name: 'Cordless Drill',
        description: '18V Cordless Drill',
        isActive: true,
        createdAtUtc: '2026-10-23T12:00:00Z'
      }))
    }

    await TestBed.configureTestingModule({
      imports: [CreateCatalogItemDialog],
      providers: [
        {
          provide: CatalogService,
          useValue: catalogServiceStub
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCatalogItemDialog);
    component = fixture.componentInstance;
    component.visible.set(true);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require a non-whitespace name', () => {
    const nameControl = component.form.controls.name;

    nameControl.setValue('');
    expect(nameControl.invalid).toBe(true);

    nameControl.setValue('    ');
    expect(nameControl.invalid).toBe(true);

    nameControl.setValue('Cordless Drill');
    expect(nameControl.valid).toBe(true);
  })

  it('enforces catalog item field lengths', () => {
    const nameControl = component.form.controls.name;
    const descriptionControl = component.form.controls.description;

    nameControl.setValue('A'.repeat(201));
    expect(nameControl.hasError('maxlength')).toBe(true);

    nameControl.setValue('A');
    expect(nameControl.valid).toBe(true);

    descriptionControl.setValue('A'.repeat(2001));
    expect(descriptionControl.hasError('maxlength')).toBe(true);

    descriptionControl.setValue('A');
    expect(descriptionControl.valid).toBe(true);
  })

  it('should not submit the form unless the form is valid', () => {
    const form = component.form;
    const nameControl = form.controls.name;
    nameControl.setValue('');
    expect(nameControl.invalid).toBe(true);

    component.submit();
    expect(catalogServiceStub.createCatalogItem).toHaveBeenCalledTimes(0);

    nameControl.setValue('A');
    expect(nameControl.valid).toBe(true);
    component.submit();
    expect(catalogServiceStub.createCatalogItem).toHaveBeenCalledOnce();
  })

  it('submits the form data to the service request', () => {
    const form = component.form;
    form.controls.name.setValue('Cordless Drill');
    form.controls.description.setValue('18V Cordless Drill');

    const request: CreateCatalogItemRequest = {
      name: 'Cordless Drill',
      description: '18V Cordless Drill'
    }

    component.submit();
    expect(catalogServiceStub.createCatalogItem).toHaveBeenCalledWith(request);
  })

  it('tracks the processing state during submission', () => {
    const response$ = new Subject<CatalogItem>;
    catalogServiceStub.createCatalogItem.mockReturnValueOnce(response$);
    const form = component.form;
    form.controls.name.setValue('Cordless Drill');
    form.controls.description.setValue('18V Cordless Drill');

    expect(component.processing()).toBe(false);
    component.submit()
    expect(component.processing()).toBe(true);

    response$.next({
      id: '0192f7d6-12ab-7000-8000-000000000001',
      name: 'Cordless Drill',
      description: '18V Cordless Drill',
      isActive: true,
      createdAtUtc: '2026-10-23T12:00:00Z'
    })
    expect(component.processing()).toBe(true);
    response$.complete();
    expect(component.processing()).toBe(false);
  })

  it('resets processing state in case of an error', () => {
    const response$ = new Subject<CatalogItem>;
    catalogServiceStub.createCatalogItem.mockReturnValueOnce(response$);

    const form = component.form;
    form.controls.name.setValue('Cordless Drill');
    form.controls.description.setValue('18V Cordless Drill');

    expect(component.processing()).toBe(false);
    component.submit();
    expect(component.processing()).toBe(true);

    response$.error(new Error('Test error.'));
    expect(component.processing()).toBe(false);
    expect(component.errorMessage()).toEqual('Unable to process request.');
  })

  it('clears the error after a subsequent retry', () => {
    const initialResponse$ = new Subject<CatalogItem>;
    catalogServiceStub.createCatalogItem.mockReturnValueOnce(initialResponse$);

    const form = component.form;
    form.controls.name.setValue('Cordless Drill');
    form.controls.description.setValue('18V Cordless Drill');

    expect(component.errorMessage()).toEqual('');
    component.submit();
    initialResponse$.error(new Error('Test error.'));
    expect(component.errorMessage()).toEqual('Unable to process request.');

    const newResponse$ = new Subject<CatalogItem>;
    catalogServiceStub.createCatalogItem.mockReturnValueOnce(newResponse$);
    component.submit();
    expect(component.errorMessage()).toEqual('');
    newResponse$.complete();
  })

  it('prevents duplicate submissions', () => {
    const response$ = new Subject<CatalogItem>;
    catalogServiceStub.createCatalogItem.mockReturnValueOnce(response$);

    const form = component.form;
    form.controls.name.setValue('Cordless Drill');
    form.controls.description.setValue('18V Cordless Drill');

    component.submit();
    component.submit();
    response$.complete();

    expect(catalogServiceStub.createCatalogItem).toHaveBeenCalledOnce();
  })

  it('outputs a created event on succesful creation', () => {
    const response$ = new Subject<CatalogItem>;
    catalogServiceStub.createCatalogItem.mockReturnValueOnce(response$);

    const createdHandler = vi.fn();
    component.created.subscribe(createdHandler);

    const form = component.form;
    form.controls.name.setValue('Cordless Drill');
    form.controls.description.setValue('18V Cordless Drill');

    component.submit();

    expect(createdHandler).not.toHaveBeenCalled();

    response$.next({
      id: '0192f7d6-12ab-7000-8000-000000000001',
      name: 'Cordless Drill',
      description: null,
      isActive: true,
      createdAtUtc: '2026-10-23T12:00:00Z',
    });

    expect(createdHandler).toHaveBeenCalledOnce();
    response$.complete();
  })
  it('closes dialog on succesful creation', () => {
    const response$ = new Subject<CatalogItem>();
    catalogServiceStub.createCatalogItem.mockReturnValueOnce(response$);

    component.form.controls.name.setValue('Cordless Drill');

    expect(component.visible()).toBe(true);
    component.submit();
    expect(component.visible()).toBe(true);

    response$.next({
      id: '0192f7d6-12ab-7000-8000-000000000001',
      name: 'Cordless Drill',
      description: null,
      isActive: true,
      createdAtUtc: '2026-10-23T12:00:00Z',
    });

    expect(component.visible()).toBe(false);
    response$.complete();
  })

  it('closes and resets form on cancel', () => {
    const form = component.form;
    form.controls.name.setValue('Cordless Drill');
    form.controls.description.setValue('18V Cordless Drill');

    expect(component.visible()).toBe(true);

    component.closeAndResetForm()

    expect(component.visible()).toBe(false);
    expect(form.controls.name.value).toEqual('');
    expect(form.controls.description.value).toEqual('');
  })

  it('resets form on succesful creation', () => {
    const form = component.form;
    form.controls.name.setValue('Cordless Drill');
    form.controls.description.setValue('18V Cordless Drill');

    component.submit();

    expect(form.controls.name.value).toEqual('');
    expect(form.controls.description.value).toEqual('');
  })

  it('clears previous errors when closing the dialog', () => {
    component.errorMessage.set('Unable to process request.');

    component.closeAndResetForm();

    expect(component.errorMessage()).toBe('');
  });

  it('closes the dialog when escape is pressed', async () => {
    expect(component.visible()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(component.visible()).toBe(false);
  })

  it('prevents closing the dialog with escape while processing', async () => {
    const request$ = new Subject<CatalogItem>;
    catalogServiceStub.createCatalogItem.mockReturnValueOnce(request$);
    const form = component.form;
    form.controls.name.setValue("Cordless Drill");

    expect(component.processing()).toBe(false);
    component.submit();
    await fixture.whenStable();

    expect(component.processing()).toBe(true);
    expect(component.visible()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(component.processing()).toBe(true);
    expect(component.visible()).toBe(true);

    request$.complete();
  })
});
