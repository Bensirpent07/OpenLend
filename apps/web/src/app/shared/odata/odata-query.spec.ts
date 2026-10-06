import { buildODataQuery, ODataQueryFilter } from './odata-query';

describe('buildODataQuery', () => {
  it('builds paging query options without sorting', () => {
    const query = buildODataQuery({
      first: 20,
      rows: 10,
    });

    expect(query).toBe('$skip=20&$top=10&$count=true');
  });

  it('builds paging and sorting query options', () => {
    const query = buildODataQuery({
      first: 20,
      rows: 10,
      sortField: 'name',
      sortOrder: 1,
    });

    expect(query).toBe('$skip=20&$top=10&$count=true&$orderby=name asc');
  });

  it('builds descending sorting query options', () => {
    const query = buildODataQuery({
      first: 10,
      rows: 20,
      sortField: 'isActive',
      sortOrder: -1,
    });

    expect(query).toBe('$skip=10&$top=20&$count=true&$orderby=isActive desc');
  });

  it('builds query filter options', () => {
    const queryFilter: ODataQueryFilter = {
      field: 'name',
      value: 'Drill',
      matchMode: 'contains'
    };
    const query = buildODataQuery({
      first: 20,
      rows: 10,
      filter: queryFilter
    })

    expect(query).toBe(`$skip=20&$top=10&$count=true&$filter=contains(name,'Drill')`)
  })

  it('builds query filter options with escaping', () => {
    const queryFilter: ODataQueryFilter = {
      field: 'name',
      value: "O'Reillys",
      matchMode: 'contains'
    };
    const query = buildODataQuery({
      first: 20,
      rows: 10,
      filter: queryFilter
    })

    expect(query).toBe(`$skip=20&$top=10&$count=true&$filter=contains(name,'O''Reillys')`)
  })
});
