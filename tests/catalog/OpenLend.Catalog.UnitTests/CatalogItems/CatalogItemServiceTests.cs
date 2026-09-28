using Ardalis.Result;

using Moq;

using OpenLend.Catalog.Application.CatalogItems;
using OpenLend.Catalog.Domain.CatalogItems;

namespace OpenLend.Catalog.UnitTests.CatalogItems;

public sealed class CatalogItemServiceTests
{
    [Fact]
    public async Task CreateAsync_WithValidInput_ReturnsSuccessAndAddsCatalogItem()
    {
        var repository = new Mock<ICatalogItemRepository>();
        var service = new CatalogItemService(repository.Object);

        var result = await service.CreateAsync(
            "Test Item",
            "Test Description",
            TestContext.Current.CancellationToken);

        Assert.True(result.IsSuccess);

        var item = result.Value;

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

    [Fact]
    public async Task CreateAsync_WithInvalidInput_ReturnsInvalidAndDoesNotAddCatalogItem()
    {
        var repository = new Mock<ICatalogItemRepository>();
        var service = new CatalogItemService(repository.Object);

        var result = await service.CreateAsync(
            "   ",
            ct: TestContext.Current.CancellationToken);

        Assert.Equal(ResultStatus.Invalid, result.Status);
        Assert.Single(result.ValidationErrors);

        repository.Verify(
            x => x.AddAsync(
                It.IsAny<CatalogItem>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task GetByIdAsync_WhenItemDoesNotExist_ReturnsNotFound()
    {
        var ct = TestContext.Current.CancellationToken;
        var id = Guid.NewGuid();

        var repository = new Mock<ICatalogItemRepository>();

        repository
            .Setup(x => x.GetByIdAsync(id, ct))
            .ReturnsAsync((CatalogItem?)null);

        var service = new CatalogItemService(repository.Object);

        var result = await service.GetByIdAsync(id, ct);

        Assert.Equal(ResultStatus.NotFound, result.Status);

        repository.Verify(
            x => x.GetByIdAsync(id, ct),
            Times.Once);
    }
}