import { TestBed } from '@angular/core/testing';
import { CatalogStore } from './catalog-store';
import { Mocked } from 'vitest';
import { CatalogService } from '../services/catalog-service';
import { ODataResponse } from '../models/odata-response';
import { CatalogItem } from '../models/catalog-item';
import { Subject } from 'rxjs';
import { ODataQueryState } from '../../shared/odata/odata-query';

describe('CatalogStore', () => {
  let store: InstanceType<typeof CatalogStore>;
  let catalogServiceStub: Mocked<Pick<CatalogService, 'getCatalogItems'>>;
  let response$: Subject<ODataResponse<CatalogItem>>;

  beforeEach(() => {
    response$ = new Subject<ODataResponse<CatalogItem>>();
    catalogServiceStub = {
      getCatalogItems: vi.fn<CatalogService['getCatalogItems']>().mockReturnValue(response$),
    };
    TestBed.configureTestingModule({
      providers: [
        CatalogStore,
        {
          provide: CatalogService,
          useValue: catalogServiceStub,
        },
      ],
    });

    store = TestBed.inject(CatalogStore);
  });

  afterEach(() => {
    response$.complete();
  });

  it('requests the catalog query and tracks loading while awaiting a response', () => {
    const query: ODataQueryState = {
      first: 20,
      rows: 20,
      sortField: 'name',
      sortOrder: 1,
    };

    expect(store.loading()).toBe(false);

    store.loadCatalog(query);

    expect(catalogServiceStub.getCatalogItems).toHaveBeenCalledOnce();
    expect(catalogServiceStub.getCatalogItems).toHaveBeenCalledWith(
      '$skip=20&$top=20&$count=true&$orderby=name asc',
    );
    expect(store.loading()).toBe(true);
  });

  it('stores catalog items and total count and clears loading on success', () => {
    const items: CatalogItem[] = [
      {
        id: '0192f7d6-12ab-7000-8000-000000000001',
        name: 'Cordless Drill',
        description: '18V cordless drill',
        isActive: true,
        createdAtUtc: '2026-10-26T12:00:00Z',
      },
    ];

    store.loadCatalog({ first: 0, rows: 20 });

    expect(store.loading()).toBe(true);

    response$.next({
      '@odata.count': 37,
      value: items,
    });
    response$.complete();

    expect(store.items()).toEqual(items);
    expect(store.totalRecords()).toBe(37);
    expect(store.loading()).toBe(false);
  });

  it('defaults the total count to zero when the response omits it', () => {
    store.loadCatalog({ first: 0, rows: 20 });

    response$.next({ value: [] });
    response$.complete();

    expect(store.totalRecords()).toBe(0);
  });

  it('clears loading and exposes an error when the catalog request fails', () => {
    store.loadCatalog({ first: 0, rows: 20 });

    expect(store.loading()).toBe(true);
    expect(store.errorMessage()).toBeNull();

    response$.error(new Error('Network failure'));

    expect(store.loading()).toBe(false);
    expect(store.errorMessage()).toBe('Unable to load catalog items.');
  });

  it('clears the previous error and successfully loads on retry', () => {
    const query: ODataQueryState = { first: 0, rows: 20 };

    store.loadCatalog(query);
    response$.error(new Error('Network failure'));

    expect(store.errorMessage()).toBe('Unable to load catalog items.');

    response$ = new Subject<ODataResponse<CatalogItem>>();
    catalogServiceStub.getCatalogItems.mockReturnValueOnce(response$);

    store.loadCatalog(query);

    expect(catalogServiceStub.getCatalogItems).toHaveBeenCalledTimes(2);
    expect(store.loading()).toBe(true);
    expect(store.errorMessage()).toBeNull();

    response$.next({
      '@odata.count': 0,
      value: [],
    });
    response$.complete();

    expect(store.items()).toEqual([]);
    expect(store.totalRecords()).toBe(0);
    expect(store.loading()).toBe(false);
    expect(store.errorMessage()).toBeNull();
  });

  it('ignores an older response while loading the latest query', () => {
    const olderResponse$ = response$;

    store.loadCatalog({ first: 0, rows: 20 });

    response$ = new Subject<ODataResponse<CatalogItem>>();
    catalogServiceStub.getCatalogItems.mockReturnValueOnce(response$);

    store.loadCatalog({ first: 20, rows: 20 });

    olderResponse$.next({
      '@odata.count': 99,
      value: [],
    });

    expect(store.totalRecords()).toBe(0);
    expect(store.loading()).toBe(true);

    response$.next({
      '@odata.count': 42,
      value: [],
    });
    response$.complete();

    expect(store.totalRecords()).toBe(42);
    expect(store.loading()).toBe(false);

    olderResponse$.complete();
  });

  it('refreshes the catalog using the latest paging and sorting query', () => {
    store.loadCatalog({
      first: 20,
      rows: 20,
      sortField: 'name',
      sortOrder: -1,
    });

    response$.next({ '@odata.count': 37, value: [] });
    response$.complete();

    response$ = new Subject<ODataResponse<CatalogItem>>();
    catalogServiceStub.getCatalogItems.mockReturnValueOnce(response$);
    catalogServiceStub.getCatalogItems.mockClear();

    store.refreshCatalog();

    expect(catalogServiceStub.getCatalogItems).toHaveBeenCalledOnce();
    expect(catalogServiceStub.getCatalogItems).toHaveBeenCalledWith(
      '$skip=20&$top=20&$count=true&$orderby=name desc',
    );
    expect(store.loading()).toBe(true);

    response$.next({ '@odata.count': 38, value: [] });
    response$.complete();

    expect(store.totalRecords()).toBe(38);
    expect(store.loading()).toBe(false);
  });
});
