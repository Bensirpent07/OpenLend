using Ardalis.Result;

using OpenLend.Catalog.Domain.CatalogItems;

namespace OpenLend.Catalog.Application.CatalogItems;

public sealed class CatalogItemService(ICatalogItemRepository repository)
{
    public async Task<Result<CatalogItem>> CreateAsync(
        string name,
        string? description = null,
        CancellationToken ct = default)
    {
        var result = CatalogItem.Create(name, description);

        if (!result.IsSuccess)
        {
            return result;
        }

        await repository.AddAsync(result.Value, ct);

        return result;
    }

    public async Task<Result<CatalogItem>> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var item = await repository.GetByIdAsync(id, ct);

        if (item is null)
        {
            return Result<CatalogItem>.NotFound();
        }

        return Result<CatalogItem>.Success(item);
    }
}