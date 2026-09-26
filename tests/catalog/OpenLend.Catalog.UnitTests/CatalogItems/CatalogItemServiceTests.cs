using Moq;

using OpenLend.Catalog.Application.CatalogItems;
using OpenLend.Catalog.Domain.CatalogItems;

namespace OpenLend.Catalog.UnitTests.CatalogItems;

public sealed class CatalogItemServiceTests
{
    [Fact]
    public async Task CreateAsync_WithValidInput_ReturnsAndAddsCatalogItem()
    {
        var repository = new Mock<ICatalogItemRepository>();
        var service = new CatalogItemService(repository.Object);

        var item = await service.CreateAsync("Test Item", "Test Description", TestContext.Current.CancellationToken);

        Assert.NotEqual(Guid.Empty, item.Id);
        Assert.Equal("Test Item", item.Name);
        Assert.Equal("Test Description", item.Description);
        Assert.True(item.IsActive);

        repository.Verify(
            x => x.AddAsync(
                It.Is<CatalogItem>(catalogItem =>
                    catalogItem.Id == item.Id),
                TestContext.Current.CancellationToken),
            Times.Once);
    }
}
