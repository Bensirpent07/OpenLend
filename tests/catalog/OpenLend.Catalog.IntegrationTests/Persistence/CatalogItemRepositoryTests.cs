using Microsoft.EntityFrameworkCore;
using OpenLend.Catalog.Domain.CatalogItems;
using OpenLend.Catalog.Infrastructure.Persistence;
using OpenLend.Catalog.Infrastructure.Persistence.Repositories;

using Testcontainers.MySql;

namespace OpenLend.Catalog.IntegrationTests.Persistence;

public sealed class CatalogItemRepositoryTests
{
    [Fact]
    public async Task AddAsync_PersistsCatalogItem()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var mysql = new MySqlBuilder("mysql:8.4.11")
            .Build();
        await mysql.StartAsync(ct);

        var options = new DbContextOptionsBuilder<CatalogDbContext>()
                .UseMySQL(mysql.GetConnectionString())
                .Options;

        await using var dbContext = new CatalogDbContext(options);
        await dbContext.Database.MigrateAsync(ct);

        var repository = new CatalogItemRepository(dbContext);
        var item = new CatalogItem(
            "Cordless Drill",
            "18V drill");

        await repository.AddAsync(item, ct);

        dbContext.ChangeTracker.Clear();

        var savedItem = await dbContext.CatalogItems.SingleAsync(x => x.Id == item.Id, ct);

        Assert.Equal("Cordless Drill", savedItem.Name);
        Assert.Equal("18V drill", savedItem.Description);
        Assert.True(savedItem.IsActive);
    }
}
