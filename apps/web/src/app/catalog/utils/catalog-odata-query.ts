export interface CatalogQueryState {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: 1 | -1;
}

export function buildCatalogODataQuery(
  state: CatalogQueryState,
): string {
  let result = `$skip=${state.first.toString()}&$top=${state.rows.toString()}&$count=true`;
  if(state.sortField){
    const direction = state.sortOrder == -1 ? 'desc' : 'asc';
    result += `&$orderby=${state.sortField} ${direction}`
  }
  return result;
}
