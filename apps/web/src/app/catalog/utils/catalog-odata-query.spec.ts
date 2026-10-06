import { buildCatalogODataQuery } from './catalog-odata-query';

describe('buildCatalogODataQuery', () => {
  it('builds paging query options without sorting', () => {
    const query = buildCatalogODataQuery({
      first: 20,
      rows: 10,
    });

    expect(query).toBe('$skip=20&$top=10&$count=true');
  });

  it('builds paging and sorting query options', () => {
    const query = buildCatalogODataQuery({
      first: 20,
      rows: 10,
      sortField: 'name',
      sortOrder: 1,
    });

    expect(query).toBe('$skip=20&$top=10&$count=true&$orderby=name asc');
  });

  it('builds descending sorting query options', () => {
    const query = buildCatalogODataQuery({
      first: 10,
      rows: 20,
      sortField: 'isActive',
      sortOrder: -1,
    });

    expect(query).toBe('$skip=10&$top=20&$count=true&$orderby=isActive desc');
  });
});
