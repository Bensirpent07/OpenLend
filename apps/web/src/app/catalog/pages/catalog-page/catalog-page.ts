import { Component, inject, signal } from '@angular/core';
import { TableLazyLoadEvent } from 'primeng/types/table';
import { ODataQueryFilter, ODataQueryState } from '../../../shared/odata/odata-query';
import { Table, TableModule } from 'primeng/table';
import { CreateCatalogItemDialog } from '../../components/create-catalog-item-dialog/create-catalog-item-dialog';
import { ButtonDirective } from 'primeng/button';
import { CatalogStore } from '../../store/catalog-store';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { TableWrapper } from '../../../shared/components/table-wrapper/table-wrapper';
import { LucidePlus } from '@lucide/angular';

@Component({
  imports: [TableModule, CreateCatalogItemDialog, ButtonDirective, PageHeader, TableWrapper, LucidePlus],
  selector: 'app-catalog-page',
  styleUrl: './catalog-page.scss',
  templateUrl: './catalog-page.html',
  providers: [CatalogStore],
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

  public refreshCatalog(): void {
    this.catalogStore.refreshCatalog();
  }

  public clearFilters(table: Table): void {
    table.clearFilterValues();
    table.onPageChange({ first: 0, rows: table.rows() });
  }

  private toODataQueryState(event: TableLazyLoadEvent): ODataQueryState {
    const sortField = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField;
    const sortOrder = event.sortOrder === 1 || event.sortOrder === -1 ? event.sortOrder : undefined;
    const filter: ODataQueryFilter[] = [];

    for (const field of ['name', 'description']) {
      const metadata = event.filters?.[field];
      const rule = Array.isArray(metadata) ? metadata[0] : metadata;

      if (rule && typeof rule.value === 'string') {
        filter.push({ field, matchMode: 'contains', value: rule.value });
      }
    }

    const statusFilters = event.filters?.['isActive'];
    const statusFilter = Array.isArray(statusFilters) ? statusFilters[0] : statusFilters;

    if (statusFilter && typeof statusFilter.value === 'boolean') {
      filter.push({
        field: 'isActive',
        matchMode: 'equals',
        value: statusFilter.value,
      });
    }

    return {
      first: event.first ?? 0,
      rows: event.rows ?? 20,
      sortField: sortField ?? undefined,
      sortOrder,
      filter,
    };
  }
}
