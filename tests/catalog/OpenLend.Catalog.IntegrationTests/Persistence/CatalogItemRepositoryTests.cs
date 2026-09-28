using Microsoft.EntityFrameworkCore;

using OpenLend.Catalog.Domain.CatalogItems;
using OpenLend.Catalog.Infrastructure.Persistence.Repositories;
using OpenLend.Catalog.IntegrationTests.Fixtures;

namespace OpenLend.Catalog.IntegrationTests.Persistence;

[Collection<CatalogIntegrationCollection>]
public sealed class CatalogItemRepositoryTests(
    CatalogIntegrationFixture fixture)
    : IntegrationTestBase(fixture)
{
    [Fact]
    public async Task AddAsync_PersistsCatalogItem()
    {
        var ct = TestContext.Current.CancellationToken;

        await using var dbContext = Fixture.CreateDbContext();

        var repository = new CatalogItemRepository(dbContext);

        var result = CatalogItem.Create(
            "Cordless Drill",
            "18V drill");

        Assert.True(result.IsSuccess);

        var item = result.Value;

        await repository.AddAsync(item, ct);

        dbContext.ChangeTracker.Clear();

        var savedItem = await dbContext.CatalogItems
            .SingleAsync(x => x.Id == item.Id, ct);

        Assert.Equal("Cordless Drill", savedItem.Name);
        Assert.Equal("18V drill", savedItem.Description);
        Assert.True(savedItem.IsActive);
    }

    [Fact]
    public async Task GetByIdAsync_RetrievesCatalogItem()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = CatalogItem.Create(
            "Cordless Drill",
            "18V drill");

        Assert.True(result.IsSuccess);

        var item = result.Value;

        await using (var setupContext = Fixture.CreateDbContext())
        {
            setupContext.CatalogItems.Add(item);
            await setupContext.SaveChangesAsync(ct);
        }

        await using var dbContext = Fixture.CreateDbContext();

        var repository = new CatalogItemRepository(dbContext);

        var retrievedItem =
            await repository.GetByIdAsync(item.Id, ct);

        Assert.NotNull(retrievedItem);
        Assert.Equal(item.Id, retrievedItem.Id);
        Assert.Equal(item.Name, retrievedItem.Name);
        Assert.Equal(item.Description, retrievedItem.Description);
        Assert.Equal(item.IsActive, retrievedItem.IsActive);
    }
}