export type ODataQueryFilter =
  | { field: string; matchMode: 'contains'; value: string }
  | { field: string; matchMode: 'equals'; value: string | boolean };

export interface ODataSortField {
  field: string;
  order: 1 | -1;
}

export interface ODataQueryState {
  first: number;
  rows: number;
  sortFields?: ODataSortField[];
  filter?: ODataQueryFilter[];
}

export function buildODataQuery(
  state: ODataQueryState,
): string {
  let result = `$skip=${state.first.toString()}&$top=${state.rows.toString()}&$count=true`;

  if (state.sortFields?.length) {
    const clauses = state.sortFields.map(({ field, order }) =>
      `${field} ${order === 1 ? 'asc' : 'desc'}`,
    );
    result += `&$orderby=${clauses.join(', ')}`;
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
