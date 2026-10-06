import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogPage } from './catalog-page';
import { of } from 'rxjs';
import { TableLazyLoadEvent } from 'primeng/table';
import { CatalogService } from '../../services/catalog-service';

describe('CatalogPage', () => {
  let component: CatalogPage;
  let fixture: ComponentFixture<CatalogPage>;
  const catalogService = {
    getCatalogItems: vi.fn()
  }

  beforeEach(async () => {
    catalogService.getCatalogItems.mockReset();
    catalogService.getCatalogItems.mockReturnValue(
      of({
        '@odata.count': 0,
        value: [],
      }),
    );

    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [
        {
          provide: CatalogService,
          useValue: catalogService
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

    expect(catalogService.getCatalogItems).toHaveBeenCalledWith(
      '$skip=10&$top=20&$count=true&$orderby=name asc'
    )
  });
});
