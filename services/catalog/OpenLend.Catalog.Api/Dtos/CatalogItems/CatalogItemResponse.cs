namespace OpenLend.Catalog.Api.Dtos.CatalogItems;

public sealed class CatalogItemResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
