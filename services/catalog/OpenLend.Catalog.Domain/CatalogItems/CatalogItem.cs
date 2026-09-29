using System.ComponentModel.DataAnnotations;

using Ardalis.Result;

namespace OpenLend.Catalog.Domain.CatalogItems;

public sealed class CatalogItem
{
    private const int MaxNameLength = 200;
    private const int MaxDescriptionLength = 2000;

    [Key]
    public Guid Id { get; private set; }

    [MaxLength(MaxNameLength)]
    public string Name { get; private set; } = string.Empty;

    [MaxLength(MaxDescriptionLength)]
    public string? Description { get; private set; }

    public bool IsActive { get; private set; }

    public DateTime CreatedAtUtc { get; private set; }

    private CatalogItem()
    {
    }

    public static Result<CatalogItem> Create(
        string name,
        string? description = null)
    {
        var errors = new List<ValidationError>();

        var trimmedName = name?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(name))
        {
            errors.Add(
                new ValidationError(
                    nameof(Name),
                    "Catalog item name is required."));
        }
        else if (trimmedName.Length > MaxNameLength)
        {
            errors.Add(
                new ValidationError(
                    nameof(Name),
                    $"Catalog item name cannot exceed {MaxNameLength} characters."));
        }

        var trimmedDescription = description?.Trim();

        if (trimmedDescription?.Length > MaxDescriptionLength)
        {
            errors.Add(
                new ValidationError(
                    nameof(Description),
                    $"Catalog item description cannot exceed {MaxDescriptionLength} characters."));
        }

        if (errors.Count > 0)
        {
            return Result<CatalogItem>.Invalid(errors);
        }

        var item = new CatalogItem
        {
            Id = Guid.CreateVersion7(),
            Name = trimmedName,
            Description = trimmedDescription,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        return Result<CatalogItem>.Success(item);
    }
}