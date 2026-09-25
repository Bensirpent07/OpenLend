using Microsoft.EntityFrameworkCore;
using OpenLend.Catalog.Domain.CatalogItems;
using OpenLend.Catalog.Infrastructure.Persistence.Converters;

namespace OpenLend.Catalog.Infrastructure.Persistence;

public sealed class CatalogDbContext(DbContextOptions<CatalogDbContext> options) : DbContext(options)
{
    public DbSet<CatalogItem> CatalogItems => Set<CatalogItem>();

    protected override void ConfigureConventions(
    ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);

        configurationBuilder
            .Properties<Guid>()
            .HaveConversion<Uuid7GuidConverter>()
            .HaveColumnType("binary(16)");
    }
}
