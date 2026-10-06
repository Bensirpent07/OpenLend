import { Component, inject } from '@angular/core';
import { CatalogService } from '../../services/catalog-service';
import { TableLazyLoadEvent } from 'primeng/types/table';
import { buildODataQuery, ODataQueryState } from '../../../shared/odata/odata-query';

@Component({
  imports: [],
  selector: 'app-catalog-page',
  styleUrl: './catalog-page.scss',
  templateUrl: './catalog-page.html',
})
export class CatalogPage {
  private readonly catalogService = inject(CatalogService);

  public loadCatalog(event: TableLazyLoadEvent) {
    const queryState: ODataQueryState = this.toODataQueryState(event);
    const query = buildODataQuery(queryState);
    this.catalogService.getCatalogItems(query).subscribe();
  }

  private toODataQueryState(event: TableLazyLoadEvent): ODataQueryState {
    const sortField = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField;
    const sortOrder = event.sortOrder === 1 || event.sortOrder === -1 ? event.sortOrder : undefined;

    return {
      first: event.first ?? 0,
      rows: event.rows ?? 20,
      sortField: sortField ?? undefined,
      sortOrder,
    };
  }
}
