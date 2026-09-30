export interface CatalogItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAtUtc: string;
}
