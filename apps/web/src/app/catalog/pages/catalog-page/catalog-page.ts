import { Component, inject, signal } from '@angular/core';
import { CatalogService } from '../../services/catalog-service';
import { TableLazyLoadEvent } from 'primeng/types/table';
import { buildODataQuery, ODataQueryState } from '../../../shared/odata/odata-query';
import { CatalogItem } from '../../models/catalog-item';
import { finalize } from 'rxjs';
import { TableModule } from 'primeng/table';

@Component({
  imports: [TableModule],
  selector: 'app-catalog-page',
  styleUrl: './catalog-page.scss',
  templateUrl: './catalog-page.html',
})
export class CatalogPage {
  private readonly catalogService = inject(CatalogService);
  public readonly items = signal<CatalogItem[]>([]);
  public readonly totalRecords = signal(0);
  public readonly loading = signal(false);
  public readonly errorMessage = signal<string | null>(null);

  public loadCatalog(event: TableLazyLoadEvent): void {
    const queryState: ODataQueryState = this.toODataQueryState(event);
    const query = buildODataQuery(queryState);

    this.loading.set(true);
    this.errorMessage.set(null);

    this.catalogService.getCatalogItems(query)
    .pipe(
      finalize(() => { this.loading.set(false); })
    )
    .subscribe({
      next: (response) => {
        this.items.set(response.value)
        this.totalRecords.set(response['@odata.count'] ?? 0);
      },
      error: () => {
        this.errorMessage.set('Unable to load catalog items.');
      }
    });
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
