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

        var response = await Fixture.Client.GetAsync("/odata/CatalogItems?$orderby=name&$top=2&$count=true", ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync(ct);
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        Assert.Equal(3, root.GetProperty("@odata.count").GetInt32());
        var items = root.GetProperty("value");
        Assert.Equal(2, items.GetArrayLength());
        Assert.Equal("Circular Saw", items[0].GetProperty("name").GetString());
        Assert.Equal("Cordless Drill", items[1].GetProperty("name").GetString());
    }

    [Fact]
    public async Task Get_WithPaging_ReturnsRequestedItems()
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

        var response = await Fixture.Client.GetAsync("/odata/CatalogItems?$orderby=name&$skip=1&$top=1&$count=true", ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync(ct);
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;

        Assert.Equal(3, root.GetProperty("@odata.count").GetInt32());
        var items = root.GetProperty("value");
        Assert.Equal(1, items.GetArrayLength());
        Assert.Equal("Cordless Drill", items[0].GetProperty("name").GetString());
    }

    [Fact]
    public async Task Get_WithFilter_ReturnsMatchingItems()
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
            dbContext.AddRange(
                firstResult.Value,
                secondResult.Value,
                thirdResult.Value);

            await dbContext.SaveChangesAsync(ct);
        }

        var response = await Fixture.Client.GetAsync("/odata/CatalogItems?$filter=contains(name,'Cordless')&$count=true", ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync(ct);
        using var document = JsonDocument.Parse(json);
        var root = document.RootElement;
        var items = root.GetProperty("value");

        Assert.Equal(1, root.GetProperty("@odata.count").GetInt32());
        Assert.Equal(1, items.GetArrayLength());
        Assert.Equal("Cordless Drill", items[0].GetProperty("name").GetString());
    }

    [Fact]
    public async Task Get_WithSelect_ReturnsOnlyRequestedProperties()
    {
        var ct = TestContext.Current.CancellationToken;
        var result = CatalogItem.Create("Cordless Drill", "18v drill");
        Assert.True(result.IsSuccess);

        await using (var dbContext = Fixture.CreateDbContext())
        {
            dbContext.Add(result.Value);
            await dbContext.SaveChangesAsync(ct);
        }

        var response = await Fixture.Client.GetAsync("/odata/CatalogItems?$select=id,name", ct);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync(ct);
        using var document = JsonDocument.Parse(json);

        var item = document.RootElement.GetProperty("value")[0];

        Assert.True(item.TryGetProperty("id", out _));
        Assert.True(item.TryGetProperty("name", out _));

        Assert.False(item.TryGetProperty("description", out _));
        Assert.False(item.TryGetProperty("isActive", out _));
        Assert.False(item.TryGetProperty("createdAtUtc", out _));
    }

    [Fact]
    public async Task Get_WithTopGreaterThanMaximum_ReturnsBadRequest()
    {
        var ct = TestContext.Current.CancellationToken;
        var response = await Fixture.Client.GetAsync("/odata/CatalogItems?$top=101", ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
