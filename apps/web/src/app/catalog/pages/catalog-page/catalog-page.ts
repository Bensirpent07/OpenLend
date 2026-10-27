import { Component, inject, signal } from '@angular/core';
import { TableLazyLoadEvent } from 'primeng/types/table';
import { ODataQueryState } from '../../../shared/odata/odata-query';
import { TableModule } from 'primeng/table';
import { CreateCatalogItemDialog } from '../../components/create-catalog-item-dialog/create-catalog-item-dialog';
import { ButtonDirective } from 'primeng/button';
import { CatalogStore } from '../../store/catalog-store';

@Component({
  imports: [TableModule, CreateCatalogItemDialog, ButtonDirective],
  selector: 'app-catalog-page',
  styleUrl: './catalog-page.scss',
  templateUrl: './catalog-page.html',
  providers: [CatalogStore]
})
export class CatalogPage {
  private readonly catalogStore = inject(CatalogStore);

  public readonly items = this.catalogStore.items;
  public readonly totalRecords = this.catalogStore.totalRecords;
  public readonly loading = this.catalogStore.loading;
  public readonly errorMessage = this.catalogStore.errorMessage;

  public readonly createDialogVisible = signal(false);

  public loadCatalog(event: TableLazyLoadEvent): void {
    this.catalogStore.loadCatalog(this.toODataQueryState(event));
  }

  public refreshCatalog(): void{
    this.catalogStore.refreshCatalog();
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
