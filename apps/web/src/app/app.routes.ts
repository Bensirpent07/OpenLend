import { Routes } from '@angular/router';
import { CatalogPage } from './catalog/pages/catalog-page/catalog-page';

export const routes: Routes = [
  {
    path: 'catalog',
    component: CatalogPage
  },
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full',
  },
];
