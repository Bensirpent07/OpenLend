using OpenLend.Catalog.Application.CatalogItems;
using OpenLend.Catalog.Domain.CatalogItems;

namespace OpenLend.Catalog.Infrastructure.Persistence.Repositories;

public sealed class CatalogItemRepository(CatalogDbContext dbContext) : ICatalogItemRepository
{
    public async Task AddAsync(CatalogItem item, CancellationToken ct = default)
    {
        dbContext.CatalogItems.Add(item);
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task<CatalogItem?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await dbContext.CatalogItems.FindAsync([id], ct);
    }
}
