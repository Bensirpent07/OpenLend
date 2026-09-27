using System.Net;
using System.Net.Http.Json;

using Microsoft.EntityFrameworkCore;

using OpenLend.Catalog.Api.Dtos.CatalogItems;
using OpenLend.Catalog.IntegrationTests.Fixtures;

namespace OpenLend.Catalog.IntegrationTests.Api;

[Collection<CatalogIntegrationCollection>]
public sealed class CatalogItemsControllerTests(
    CatalogIntegrationFixture fixture)
    : IntegrationTestBase(fixture)
{
    [Fact]
    public async Task Post_WithValidRequest_ReturnsCreatedAndPersistsItem()
    {
        var ct = TestContext.Current.CancellationToken;

        var response = await Fixture.Client.PostAsJsonAsync(
            "/api/catalog/items",
            new
            {
                name = "Test Item",
                description = "Test Description"
            },
            ct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var responseBody =
            await response.Content.ReadFromJsonAsync<CreateCatalogItemResponse>(
                cancellationToken: ct);

        Assert.NotNull(responseBody);
        Assert.NotEqual(Guid.Empty, responseBody.Id);
        Assert.Equal("Test Item", responseBody.Name);
        Assert.Equal("Test Description", responseBody.Description);
        Assert.True(responseBody.IsActive);

        Assert.Equal(
            $"/api/catalog/items/{responseBody.Id}",
            response.Headers.Location?.ToString());

        await using var dbContext = Fixture.CreateDbContext();

        var item = await dbContext.CatalogItems.SingleAsync(ct);

        Assert.Equal("Test Item", item.Name);
        Assert.Equal("Test Description", item.Description);
        Assert.True(item.IsActive);
    }

    [Fact]
    public async Task Post_WithBlankName_ReturnsBadRequest()
    {
        var ct = TestContext.Current.CancellationToken;

        var response = await Fixture.Client.PostAsJsonAsync(
            "/api/catalog/items",
            new
            {
                name = "   ",
                description = "Test Description"
            },
            ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        await using var dbContext = Fixture.CreateDbContext();

        Assert.Empty(await dbContext.CatalogItems.ToListAsync(ct));
    }
}