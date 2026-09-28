using System.ComponentModel.DataAnnotations;

namespace OpenLend.Catalog.Api.Dtos.CatalogItems;

public sealed record GetCatalogItemResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public bool IsActive { get; init; }

    public DateTime CreatedAtUtc { get; init; }
}
