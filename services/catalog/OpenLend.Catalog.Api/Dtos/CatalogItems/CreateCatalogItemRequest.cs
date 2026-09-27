using System.ComponentModel.DataAnnotations;

namespace OpenLend.Catalog.Api.Dtos.CatalogItems;

public sealed class CreateCatalogItemRequest
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}