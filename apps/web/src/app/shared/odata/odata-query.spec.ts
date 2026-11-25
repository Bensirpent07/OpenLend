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
      sortFields: [{ field: 'name', order: 1 }]
    });

    expect(query).toBe('$skip=20&$top=10&$count=true&$orderby=name asc');
  });

  it('builds descending sorting query options', () => {
    const query = buildODataQuery({
      first: 10,
      rows: 20,
      sortFields: [{ field: 'isActive', order: -1 }]
    });

    expect(query).toBe('$skip=10&$top=20&$count=true&$orderby=isActive desc');
  });

  it('builds multiple sorty query options', () => {
    const query = buildODataQuery({
      first: 10,
      rows: 20,
      sortFields: [
        { field: 'isActive', order: 1 },
        { field: 'name', order: -1 }
      ]
    })

    expect(query).toBe('$skip=10&$top=20&$count=true&$orderby=isActive asc, name desc');
  })

  it('builds query filter with contains options', () => {
    const queryFilter: ODataQueryFilter = {
      field: 'name',
      value: 'Drill',
      matchMode: 'contains'
    };
    const query = buildODataQuery({
      first: 20,
      rows: 10,
      filter: [queryFilter]
    })

    expect(new URLSearchParams(query).get('$filter')).toBe("contains(name,'Drill')");
  })

  it('builds query filter with equals options', () => {
    const queryFilter: ODataQueryFilter = {
      field: 'name',
      value: 'Drill',
      matchMode: 'equals'
    };
    const query = buildODataQuery({
      first: 20,
      rows: 10,
      filter: [queryFilter]
    })

    expect(new URLSearchParams(query).get('$filter')).toBe("name eq 'Drill'");
  })

  it('builds query filter with "and" filter options', () => {
    const queryFilter: ODataQueryFilter[] = [
      {
        field: 'name',
        value: 'Drill',
        matchMode: 'contains'
      },
      {
        field: 'description',
        value: '12V Cordless Drill',
        matchMode: 'equals'
      }
    ]

    const query = buildODataQuery({
      first: 20,
      rows: 10,
      filter: queryFilter
    })

    expect(new URLSearchParams(query).get('$filter')).toBe(
      "contains(name,'Drill') and description eq '12V Cordless Drill'",
    );
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
      filter: [queryFilter]
    })

    expect(new URLSearchParams(query).get('$filter')).toBe("contains(name,'O''Reillys')");
  })

  it('builds query filter with a boolean value', () => {
    const queryFilter: ODataQueryFilter = {
      field: 'isActive',
      value: true,
      matchMode: 'equals'
    }
    const query = buildODataQuery({
      first: 20,
      rows: 10,
      filter: [queryFilter]
    })

    expect(new URLSearchParams(query).get('$filter')).toBe('isActive eq true');
  })

  it('should not build `orderby` query when no sorting is provided', () => {
    const query = buildODataQuery({
      first: 20,
      rows: 10,
      sortFields: []
    })

    expect(new URLSearchParams(query).get('$orderby')).toBeNull();
  })
});
