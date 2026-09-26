using OpenLend.Catalog.Domain.CatalogItems;

namespace OpenLend.Catalog.Application.CatalogItems;

public sealed class CatalogItemService(ICatalogItemRepository repository)
{
    public async Task<CatalogItem> CreateAsync(string name, string? description = null, CancellationToken ct = default)
    {
        var item = new CatalogItem(name, description);
        await repository.AddAsync(item, ct);
        return item;
    }
}
