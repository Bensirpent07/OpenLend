export interface ODataQueryFilter{
  field: string;
  value: string;
  matchMode: 'contains';
}

export interface ODataQueryState {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: 1 | -1;
  filter?: ODataQueryFilter;
}

export function buildODataQuery(
  state: ODataQueryState,
): string {
  let result = `$skip=${state.first.toString()}&$top=${state.rows.toString()}&$count=true`;

  if(state.sortField){
    const direction = state.sortOrder === -1 ? 'desc' : 'asc';
    result += `&$orderby=${state.sortField} ${direction}`
  }

  if(state.filter){
    const escapedValue = state.filter.value.replaceAll("'", "''");
    result += `&$filter=${state.filter.matchMode}(${state.filter.field},'${escapedValue}')`
  }

  return result;
}
