using System.ComponentModel.DataAnnotations;

namespace OpenLend.Catalog.Domain.CatalogItems
{
    public sealed class CatalogItem
    {
        public Guid Id { get; private set; }
        [MaxLength(200)]
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
            Id = Guid.CreateVersion7();
            Name = name.Trim();
            Description = description?.Trim();
            IsActive = true;
            CreatedAtUtc = DateTime.UtcNow;
        }
    }
}
