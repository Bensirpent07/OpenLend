using System.Net;
using System.Text.Json;

using OpenLend.Catalog.Domain.CatalogItems;
using OpenLend.Catalog.IntegrationTests.Fixtures;

namespace OpenLend.Catalog.IntegrationTests.Api;

[Collection<CatalogIntegrationCollection>]
public sealed class CatalogItemsODataControllerTests(CatalogIntegrationFixture fixture) : IntegrationTestBase(fixture)
{
    [Fact]
    public async Task Get_WithTopAndOrderBy_ReturnsRequestedItems()
    {
        var ct = TestContext.Current.CancellationToken;
        var firstResult = CatalogItem.Create("Circular Saw", "Cordless saw");
        var secondResult = CatalogItem.Create("Cordless Drill", "18v drill");
        var thirdResult = CatalogItem.Create("Hammer", "Claw Hammer");

        Assert.True(firstResult.IsSuccess);
        Assert.True(secondResult.IsSuccess);
        Assert.True(thirdResult.IsSuccess);

        await using (var dbContext = Fixture.CreateDbContext())
        {
            dbContext.AddRange(firstResult.Value, secondResult.Value, thirdResult.Value);
            await dbContext.SaveChangesAsync(ct);
        }

        var response = await Fixture.Client.GetAsync("/odata/CatalogItems?$orderby=Name&$top=2&$count=true", ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync(ct);
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        Assert.Equal(3, root.GetProperty("@odata.count").GetInt32());
        var items = root.GetProperty("value");
        Assert.Equal(2, items.GetArrayLength());
        Assert.Equal("Circular Saw", items[0].GetProperty("Name").GetString());
        Assert.Equal("Cordless Drill", items[1].GetProperty("Name").GetString());
    }

    [Fact]
    public async Task Get_WithTopAndSkip_ReturnsRequestedItems()
    {
        var ct = TestContext.Current.CancellationToken;
        var firstResult = CatalogItem.Create("Circular Saw", "Cordless saw");
        var secondResult = CatalogItem.Create("Cordless Drill", "18v drill");
        var thirdResult = CatalogItem.Create("Hammer", "Claw Hammer");

        Assert.True(firstResult.IsSuccess);
        Assert.True(secondResult.IsSuccess);
        Assert.True(thirdResult.IsSuccess);

        await using (var dbContext = Fixture.CreateDbContext())
        {
            dbContext.AddRange(firstResult.Value, secondResult.Value, thirdResult.Value);
            await dbContext.SaveChangesAsync(ct);
        }

        var response = await Fixture.Client.GetAsync("/odata/CatalogItems?$orderby=Name&$skip=1&$top=1&$count=true", ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync(ct);
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        Assert.Equal(3, root.GetProperty("@odata.count").GetInt32());
        var items = root.GetProperty("value");
        Assert.Equal(1, items.GetArrayLength());
        Assert.Equal("Cordless Drill", items[0].GetProperty("Name").GetString());
    }

    [Fact]
    public async Task Get_WithFilter_ReturnsMatchingItems()
    {
        var ct = TestContext.Current.CancellationToken;
        var firstResult = CatalogItem.Create(
            "Circular Saw",
            "Cordless saw");

        var secondResult = CatalogItem.Create(
            "Cordless Drill",
            "18v drill");

        var thirdResult = CatalogItem.Create(
            "Hammer",
            "Claw Hammer");

        Assert.True(firstResult.IsSuccess);
        Assert.True(secondResult.IsSuccess);
        Assert.True(thirdResult.IsSuccess);

        await using (var dbContext = Fixture.CreateDbContext())
        {
            dbContext.AddRange(
                firstResult.Value,
                secondResult.Value,
                thirdResult.Value);

            await dbContext.SaveChangesAsync(ct);
        }

        var response = await Fixture.Client.GetAsync(
            "/odata/CatalogItems?$filter=contains(Name,'Cordless')&$count=true",
            ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync(ct);
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;
        var items = root.GetProperty("value");

        Assert.Equal(1, root.GetProperty("@odata.count").GetInt32());
        Assert.Equal(1, items.GetArrayLength());
        Assert.Equal("Cordless Drill", items[0].GetProperty("Name").GetString());
    }
}
