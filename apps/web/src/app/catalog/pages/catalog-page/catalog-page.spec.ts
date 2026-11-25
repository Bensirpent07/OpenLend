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

  it('requests the first page sorted by name when the table initializes', () => {
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        first: 0,
        rows: 20,
        filter: [],
        sortFields: [{ field: 'name', order: 1 }],
      }),
    );
  });

  it('passes table paging and sorting changes to the store', () => {
    catalogStoreStub.loadCatalog.mockClear();
    const expectedState: ODataQueryState = {
      first: 20,
      rows: 20,
      filter: [],
      sortFields: [{ field: 'name', order: 1 }]
    }

    table.onLazyLoad.emit({
      first: 20,
      rows: 20,
      multiSortMeta: [
        { field: 'name', order: 1 }
      ]
    });

    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith(expectedState);
  });

  it('uses default paging and omits an unsupported sort order', () => {
    catalogStoreStub.loadCatalog.mockClear();
    const expectedState: ODataQueryState = {
      first: 0,
      rows: 20,
      filter: [],
      sortFields: [{ field: 'description', order: -1 }],
    };

    table.onLazyLoad.emit({
      multiSortMeta: [
        { field: 'name', order: 0 },
        { field: 'description', order: -1 },
      ],
    });

    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith(expectedState);
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
    const expectedState: ODataQueryState = {
      first: 20,
      rows: 20,
      filter: [{
        field: 'name',
        matchMode: 'contains',
        value: 'Drill'
      }],
      sortFields: []
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
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith(expectedState)
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
      }],
      sortFields: []
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
      }],
      sortFields: []
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
      ],
      sortFields: []
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
    table.multiSortMeta = [{ field: 'name', order: -1 }]
    table.onPageChange({ first: 20, rows: 20 });
    catalogStoreStub.loadCatalog.mockClear();

    const expectedState: ODataQueryState = {
      first: 0,
      rows: 20,
      sortFields: [{ field: 'name', order: -1 }],
      filter: []
    }

    const button = fixture.debugElement.query(By.css('button[aria-label="Clear filters"]'));
    (button.nativeElement as HTMLButtonElement).click();

    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith(expectedState);
  });

  it('should send multi sort information in a data request', () => {
    catalogStoreStub.loadCatalog.mockClear();
    const expectedState: ODataQueryState = {
      first: 20,
      rows: 20,
      filter: [],
      sortFields: [
        { field: 'name', order: 1 },
        { field: 'description', order: -1 }
      ]
    }

    table.onLazyLoad.emit({
      first: 20,
      rows: 20,
      multiSortMeta: [
        { field: 'name', order: 1 },
        { field: 'description', order: -1 }
      ]
    })

    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledOnce();
    expect(catalogStoreStub.loadCatalog).toHaveBeenCalledWith(expectedState);
  })
});
