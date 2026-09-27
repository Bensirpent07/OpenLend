using Ardalis.Result;

using OpenLend.Catalog.Domain.CatalogItems;

namespace OpenLend.Catalog.UnitTests.CatalogItems;

public sealed class CatalogItemTests
{
    [Fact]
    public void Create_WhenNameExceedsMaximumLength_ReturnsInvalid()
    {
        var name = new string('A', 201);

        var result = CatalogItem.Create(name);

        Assert.Equal(ResultStatus.Invalid, result.Status);

        var error = Assert.Single(result.ValidationErrors);

        Assert.Equal(nameof(CatalogItem.Name), error.Identifier);
    }

    [Fact]
    public void Create_WhenDescriptionExceedsMaximumLength_ReturnsInvalid()
    {
        var description = new string('A', 2001);

        var result = CatalogItem.Create(
            "Valid Name",
            description);

        Assert.Equal(ResultStatus.Invalid, result.Status);

        var error = Assert.Single(result.ValidationErrors);

        Assert.Equal(nameof(CatalogItem.Description), error.Identifier);
    }

    [Fact]
    public void Create_WhenNameIsBlank_ReturnsInvalid()
    {
        var result = CatalogItem.Create("   ");

        Assert.Equal(ResultStatus.Invalid, result.Status);

        var error = Assert.Single(result.ValidationErrors);

        Assert.Equal(nameof(CatalogItem.Name), error.Identifier);
    }
}