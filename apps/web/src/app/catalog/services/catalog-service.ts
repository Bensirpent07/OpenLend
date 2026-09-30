import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { ODataResponse } from '../models/odata-response';
import { CatalogItem } from '../models/catalog-item';

@Service()
export class CatalogService {
  private readonly http = inject(HttpClient);

  public getCatalogItems(query: string): Observable<ODataResponse<CatalogItem>> {
    return this.http.get<ODataResponse<CatalogItem>>(`/odata/CatalogItems?${query}`);
  }
}
