import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Table } from 'primeng/table';
import { CatalogPage } from './catalog-page';
import { CatalogStore } from '../../store/catalog-store';
import { CatalogItem } from '../../models/catalog-item';
import { ODataQueryState } from '../../../shared/odata/odata-query';
import { CreateCatalogItemDialog } from '../../components/create-catalog-item-dialog/create-catalog-item-dialog';

function createCatalogStoreStub() {
  return {
    items: signal<CatalogItem[]>([]),
    totalRecords: signal(0),
    loading: signal(false),
    errorMessage: signal<string | null>(null),
    loadCatalog: vi.fn<(query: ODataQueryState) => void>(),
    refreshCatalog: vi.fn<() => void>(),
  };
}

describe('CatalogPage', () => {
  let fixture: ComponentFixture<CatalogPage>;
  let catalogStoreStub: ReturnType<typeof createCatalogStoreStub>;
  let table: Table;
  let dialog: CreateCatalogItemDialog;

  beforeEach(async () => {
    catalogStoreStub = createCatalogStoreStub();

    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    })
      .overrideComponent(CatalogPage, {
        set: {
          providers: [
            {
              provide: CatalogStore,
              useValue: catalogStoreStub,
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CatalogPage);
    await fixture.whenStable();

    table = fixture.debugElement
      .query(By.directive(Table))
      .injector.get(Table);

    dialog = fixture.debugElement
      .query(By.directive(CreateCatalogItemDialog))
      .injector.get(CreateCatalogItemDialog);
  });

  it('requests the first page when the table initializes', () => {
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        first: 0,
        rows: 20,
        sortField: undefined,
      }),
    );
  });

  it('passes table paging and sorting changes to the store', () => {
    catalogStoreStub.loadCatalog.mockClear();

    table.onLazyLoad.emit({
      first: 20,
      rows: 20,
      sortField: 'name',
      sortOrder: 1,
    });

    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith({
      first: 20,
      rows: 20,
      sortField: 'name',
      sortOrder: 1,
      filter: []
    });
  });

  it('uses default paging and omits an unsupported sort order', () => {
    catalogStoreStub.loadCatalog.mockClear();

    table.onLazyLoad.emit({
      sortOrder: 0,
    });

    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith({
      first: 0,
      rows: 20,
      sortField: undefined,
      sortOrder: undefined,
      filter: []
    });
  });

  it('uses the first sort field when the table supplies an array', () => {
    catalogStoreStub.loadCatalog.mockClear();

    table.onLazyLoad.emit({
      first: 0,
      rows: 20,
      sortField: ['name', 'description'],
      sortOrder: -1,
    });

    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith({
      first: 0,
      rows: 20,
      sortField: 'name',
      sortOrder: -1,
      filter: []
    });
  });

  it('opens the creation dialog when Add Equipment is clicked', async () => {
    expect(dialog.visible()).toBe(false);

    fixture.debugElement
      .query(By.css('button'))
      .triggerEventHandler('click');

    await fixture.whenStable();

    expect(dialog.visible()).toBe(true);
  });

  it('synchronizes dialog dismissal with the page visibility state', async () => {
    fixture.debugElement
      .query(By.css('button'))
      .triggerEventHandler('click');

    await fixture.whenStable();

    dialog.visible.set(false);

    await fixture.whenStable();

    expect(fixture.componentInstance.createDialogVisible()).toBe(false);
  });

  it('requests a catalog refresh when the dialog emits created', () => {
    dialog.created.emit();

    expect(catalogStoreStub.refreshCatalog).toHaveBeenCalledOnce();
  });

  it('requests catalog data with name filtering when table is filtered', () => {
    catalogStoreStub.loadCatalog.mockClear();
    const expectedFilter: ODataQueryState = {
      first: 20,
      rows: 20,
      filter: [{
        field: 'name',
        matchMode: 'contains',
        value: 'Drill'
      }]
    }

    table.onLazyLoad.emit({
      first: 20,
      rows: 20,
      filters: {
        name: [{
          matchMode: 'contains',
          value: 'Drill',
          operator: 'and'
        }]
      }
    })

    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith(expectedFilter)
  });

  it('requests catalog data with description filtering', () => {
    catalogStoreStub.loadCatalog.mockClear();
    const expectedFilter: ODataQueryState = {
      first: 20,
      rows: 20,
      filter: [{
        field: 'description',
        matchMode: 'contains',
        'value': '12V Cordless Drill'
      }]
    }

    table.onLazyLoad.emit({
      first: 20,
      rows: 20,
      filters: {
        description: [{
          matchMode: 'contains',
          value: '12V Cordless Drill',
          operator: 'and'
        }]
      }
    })

    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith(expectedFilter)
  });

  it('should request catalog data with status filtering', () => {
    catalogStoreStub.loadCatalog.mockClear();
    const expectedFilter: ODataQueryState = {
      first: 20,
      rows: 20,
      filter: [{
        field: 'isActive',
        matchMode: 'equals',
        value: true
      }]
    }

    table.onLazyLoad.emit({
      first: 20,
      rows: 20,
      filters: {
        isActive: [{
          matchMode: 'equals',
          value: true,
          operator: 'and'
        }]
      }
    })

    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith(expectedFilter)
  });

  it('should send multiple filters in a data request', () => {
    catalogStoreStub.loadCatalog.mockClear();
    const expectedFilter: ODataQueryState = {
      first: 20,
      rows: 20,
      filter: [
        {
          field: 'name',
          matchMode: 'contains',
          value: 'Drill'
        },
        {
          field: 'description',
          matchMode: 'contains',
          value: '12V Cordless Drill'
        }
      ]
    }

    table.onLazyLoad.emit({
      first: 20,
      rows: 20,
      filters: {
        name: [{
          matchMode: 'contains',
          value: 'Drill',
          operator: 'and'
        }],
        description: [{
          matchMode: 'contains',
          value: '12V Cordless Drill',
          operator: 'and'
        }]
      }
    })

    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith(expectedFilter)
  })
  it('clears filters and requests the first page without filters while preserving sorting', () => {
    table.filters['name'] = [{ matchMode: 'contains', value: 'Drill', operator: 'and' }];
    table.filters['description'] = [{ matchMode: 'contains', value: 'Cordless', operator: 'and' }];
    table.filters['isActive'] = [{ matchMode: 'equals', value: false, operator: 'and' }];
    table.sortField = 'name';
    table.sortOrder = -1;
    table.onPageChange({ first: 20, rows: 20 });
    catalogStoreStub.loadCatalog.mockClear();

    const button = fixture.debugElement.query(By.css('button[aria-label="Clear filters"]'));
    (button.nativeElement as HTMLButtonElement).click();

    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith({
      first: 0,
      rows: 20,
      sortField: 'name',
      sortOrder: -1,
      filter: [],
    });
  });
});
