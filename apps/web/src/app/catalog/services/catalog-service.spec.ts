import { TestBed } from '@angular/core/testing';
import { CatalogService } from './catalog-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

describe('CatalogService', () => {
  let service: CatalogService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CatalogService,
        provideHttpClientTesting()
      ]
    })

    service = TestBed.inject(CatalogService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('requests catalog items with the supplied OData query', async () => {
    const query = '$orderby=name&$top=20&$count=true';
    const responsePromise = firstValueFrom(
      service.getCatalogItems(query),
    );

    const request = httpTesting.expectOne(
      `/odata/CatalogItems?${query}`,
    );

    expect(request.request.method).toBe('GET');

    request.flush({
      '@odata.count': 1,
      value: [
        {
          id: '0199a123-4567-7000-8000-000000000001',
          name: 'Cordless Drill',
          description: '18v drill',
          isActive: true,
          createdAtUtc: '2026-09-29T12:00:00Z',
        },
      ],
    });

    const response = await responsePromise;

    expect(response['@odata.count']).toBe(1);
    expect(response.value).toHaveLength(1);
    expect(response.value[0].name).toBe('Cordless Drill');
  });
});
