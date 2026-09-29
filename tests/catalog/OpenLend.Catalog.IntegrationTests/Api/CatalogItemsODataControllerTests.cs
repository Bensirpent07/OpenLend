using System.Net;

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
    }
}
