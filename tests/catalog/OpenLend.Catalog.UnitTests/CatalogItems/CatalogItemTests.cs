using OpenLend.Catalog.Domain.CatalogItems;

namespace OpenLend.Catalog.UnitTests.CatalogItems;
public sealed class CatalogItemTests
{
    [Fact]
    public void Constructor_WhenNameExceedsMaximumLength_ThrowsArgumentException()
    {
        var name = new string('A', 201);
        CatalogItem Act() => new(name);
        var exception = Assert.Throws<ArgumentException>(Act);
        Assert.Equal("name", exception.ParamName);
    }

    [Fact]
    public void Constructor_WhenDescriptionExceedsMaximumLength_ThrowsArgumentException()
    {
        var name = "Valid Name";
        var description = new string('A', 2001);
        CatalogItem Act() => new(name, description);
        var exception = Assert.Throws<ArgumentException>(Act);
        Assert.Equal("description", exception.ParamName);
    }
}
