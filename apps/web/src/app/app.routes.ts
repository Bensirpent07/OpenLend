import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'catalog',
    loadComponent: () =>
      import('./catalog/pages/catalog-page/catalog-page')
        .then(m => m.CatalogPage),
  },
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full',
  },
];
