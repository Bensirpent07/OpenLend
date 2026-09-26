using Moq;

using OpenLend.Catalog.Application.CatalogItems;
using OpenLend.Catalog.Domain.CatalogItems;

namespace OpenLend.Catalog.UnitTests.CatalogItems;

public sealed class CatalogItemServiceTests
{
    [Fact]
    public async Task CreateAsync_WithValidInput_AddsCatalogItem()
    {
        // Arrange
        var repository = new Mock<ICatalogItemRepository>();
        var service = new CatalogItemService(repository.Object);

        // Act
        await service.CreateAsync("Test Item", "Test Description", TestContext.Current.CancellationToken);

        // Assert
        repository.Verify(
            x => x.AddAsync(
                It.Is<CatalogItem>(item =>
                    item.Name == "Test Item" &&
                    item.Description == "Test Description"),
                TestContext.Current.CancellationToken),
            Times.Once);
    }
}
