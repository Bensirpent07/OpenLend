import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogPage } from './catalog-page';
import { of, Subject } from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';
import { CatalogService } from '../../services/catalog-service';
import { CatalogItem } from '../../models/catalog-item';
import { ODataResponse } from '../../models/odata-response';
import { Mocked } from 'vitest';

describe('CatalogPage', () => {
  let component: CatalogPage;
  let fixture: ComponentFixture<CatalogPage>;
  let catalogServiceStub: Mocked<
    Pick<CatalogService, 'getCatalogItems'>
  >;

  beforeEach(async () => {
    catalogServiceStub = {
      getCatalogItems: vi.fn<CatalogService['getCatalogItems']>()
        .mockReturnValue(
          of({
            '@odata.count': 0,
            value: [],
          }),
        ),
    };

    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [
        {
          provide: CatalogService,
          useValue: catalogServiceStub
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads catalog items using the table lazy-load state', () => {
    const event: TableLazyLoadEvent = {
      first: 10,
      rows: 20,
      sortField: 'name',
      sortOrder: 1
    }

    component.loadCatalog(event);

    expect(catalogServiceStub.getCatalogItems).toHaveBeenCalledWith(
      '$skip=10&$top=20&$count=true&$orderby=name asc'
    )
  });

  it('stores catalog items and total count', () => {
    const items: CatalogItem[] = [
      {
        id: '0192f7d6-12ab-7000-8000-000000000001',
        name: 'Cordless Drill',
        description: '18V cordless drill',
        isActive: true,
        createdAtUtc: '2026-10-23T12:00:00Z'
      }
    ]

    catalogServiceStub.getCatalogItems.mockReturnValueOnce(
      of({
        '@odata.count': 37,
        value: items
      })
    )

    component.loadCatalog({ first: 0, rows: 20 });
    expect(component.items()).toEqual(items);
    expect(component.totalRecords()).toEqual(37);
  });

  it('tracks loading state while fetching catalog itesm', () => {
    const response$ = new Subject<ODataResponse<CatalogItem>>;
    catalogServiceStub.getCatalogItems.mockReturnValueOnce(response$);
    component.loadCatalog({ first: 0, rows: 20})
    expect(component.loading()).toBe(true);
    response$.next({
      '@odata.count': 0,
      value: []
    })
    response$.complete();
    expect(component.loading()).toBe(false);
  })

  it('handles error when loading catalog items', () => {
    const response$ = new Subject<ODataResponse<CatalogItem>>;
    catalogServiceStub.getCatalogItems.mockReturnValueOnce(response$);

    component.loadCatalog({ first: 0, rows: 20});
    expect(component.loading()).toBe(true);
    response$.error(new Error('Test error'));
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe(
      'Unable to load catalog items.'
    )
  })

  it('clears a previous error message when retrying', () => {
    const initialResponse$ = new Subject<ODataResponse<CatalogItem>>;
    catalogServiceStub.getCatalogItems.mockReturnValueOnce(initialResponse$);

    component.loadCatalog({ first: 0, rows: 20});
    expect(component.loading()).toBe(true);

    initialResponse$.error(new Error('Test error'));
    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe(
      'Unable to load catalog items.'
    )

    const newResponse$ = new Subject<ODataResponse<CatalogItem>>;
    catalogServiceStub.getCatalogItems.mockReturnValueOnce(newResponse$);

    component.loadCatalog({ first: 0, rows: 20});
    expect(component.loading()).toBe(true);
    expect(component.errorMessage()).toBe(null);

    newResponse$.next({
      "@odata.count": 0,
      value: []
    })
    newResponse$.complete()
    expect(component.loading()).toBe(false);
  })

  it('loads the first page when the table initializes', () => {
    fixture.detectChanges();

    expect(catalogServiceStub.getCatalogItems).toHaveBeenCalledWith(
      '$skip=0&$top=20&$count=true'
    );
  })
});
