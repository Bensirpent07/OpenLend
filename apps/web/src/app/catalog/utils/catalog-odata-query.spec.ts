import { buildCatalogODataQuery } from './catalog-odata-query';

describe('buildCatalogODataQuery', () => {
  it('builds paging query options', () => {
    const query = buildCatalogODataQuery({
      first: 20,
      rows: 10,
    });

    expect(query).toBe(
      '$skip=20&$top=10&$count=true',
    );
  });
});
