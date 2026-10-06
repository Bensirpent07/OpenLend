export interface CatalogQueryState {
  first: number;
  rows: number;
}

export function buildCatalogODataQuery(
  state: CatalogQueryState,
): string {
  return `$skip=${state.first.toString()}&$top=${state.rows.toString()}&$count=true`;
}
