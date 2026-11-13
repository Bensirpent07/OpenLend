export type ODataQueryFilter =
  | { field: string; matchMode: 'contains'; value: string }
  | { field: string; matchMode: 'equals'; value: string | boolean };

export interface ODataQueryState {
  first: number;
  rows: number;
  sortField?: string;
  sortOrder?: 1 | -1;
  filter?: ODataQueryFilter[];
}

export function buildODataQuery(
  state: ODataQueryState,
): string {
  let result = `$skip=${state.first.toString()}&$top=${state.rows.toString()}&$count=true`;

  if(state.sortField){
    const direction = state.sortOrder === -1 ? 'desc' : 'asc';
    result += `&$orderby=${state.sortField} ${direction}`
  }

  if (state.filter?.length) {
    const clauses = state.filter.map(({ field, matchMode, value }) => {
      const literal = typeof value === 'string' ? `'${value.replaceAll("'", "''")}'` : String(value);
      return matchMode === 'contains' ? `contains(${field},${literal})` : `${field} eq ${literal}`;
    });

    result += `&$filter=${encodeURIComponent(clauses.join(' and '))}`;
  }

  return result;
}
