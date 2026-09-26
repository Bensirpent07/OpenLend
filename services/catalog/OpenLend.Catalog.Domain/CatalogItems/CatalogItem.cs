using System.ComponentModel.DataAnnotations;

namespace OpenLend.Catalog.Domain.CatalogItems;

public sealed class CatalogItem
{
    private const int MaxNameLength = 200;
    private const int MaxDescriptionLength = 2000;
    public Guid Id { get; private set; }
    [MaxLength(MaxNameLength)]
    public string Name { get; private set; } = string.Empty;
    [MaxLength(2000)]
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    private CatalogItem() { }
    public CatalogItem(string name, string? description = null)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException(
                "Catalog item name is required.",
                nameof(name));
        }

        var trimmedName = name.Trim();
        if (trimmedName.Length > MaxNameLength)
        {
            throw new ArgumentException(
                $"Catalog item name cannot exceed {MaxNameLength} characters.",
                nameof(name));
        }

        var trimmedDescription = description?.Trim();
        if (trimmedDescription != null && trimmedDescription.Length > MaxDescriptionLength)
        {
            throw new ArgumentException(
                $"Catalog item description cannot exceed {MaxDescriptionLength} characters.",
                nameof(description));
        }

        Id = Guid.CreateVersion7();
        Name = trimmedName;
        Description = trimmedDescription;
        IsActive = true;
        CreatedAtUtc = DateTime.UtcNow;
    }
}
