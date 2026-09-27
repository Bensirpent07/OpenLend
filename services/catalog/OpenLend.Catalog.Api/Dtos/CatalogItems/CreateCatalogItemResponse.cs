namespace OpenLend.Catalog.Api.Dtos.CatalogItems;

public sealed record CreateCatalogItemResponse(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    DateTime CreatedAtUtc);
