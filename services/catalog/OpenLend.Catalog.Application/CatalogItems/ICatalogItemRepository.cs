using OpenLend.Catalog.Domain.CatalogItems;

namespace OpenLend.Catalog.Application.CatalogItems;

public interface ICatalogItemRepository
{
    Task AddAsync(CatalogItem item, CancellationToken ct = default);
}
