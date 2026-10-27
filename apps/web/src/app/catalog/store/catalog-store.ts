import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { buildODataQuery, ODataQueryState } from '../../shared/odata/odata-query';
import { inject } from '@angular/core';
import { CatalogService } from '../services/catalog-service';
import { pipe, switchMap } from 'rxjs';
import { CatalogItem } from '../models/catalog-item';
import { tapResponse } from '@ngrx/operators';

interface CatalogState {
  items: CatalogItem[];
  totalRecords: number;
  loading: boolean;
  errorMessage: string | null;
  query: ODataQueryState;
}

export const CatalogStore = signalStore(
  withState<CatalogState>({
    items: [],
    totalRecords: 0,
    loading: false,
    errorMessage: null,
    query: {
      first: 0,
      rows: 20
    }
  }),

  withMethods((store, catalogService = inject(CatalogService)) => ({
    loadCatalog: rxMethod<ODataQueryState>(
      pipe(
        switchMap((query) => {
          patchState(store, {
            loading: true,
            errorMessage: null,
            query: { ...query }
          });

          return catalogService.getCatalogItems(buildODataQuery(query)).pipe(
            tapResponse({
              next: (response) => {
                patchState(store, {
                  items: response.value,
                  totalRecords: response['@odata.count'] ?? 0,
                  loading: false
                })
              },
              error: () => {
                patchState(store, {
                  loading: false,
                  errorMessage: 'Unable to load catalog items.'
                })
              }
            })
          )
        })
      )
    )
  })),

  withMethods((store) => ({
    refreshCatalog(): void {
      store.loadCatalog(store.query());
    },
  })),
);
