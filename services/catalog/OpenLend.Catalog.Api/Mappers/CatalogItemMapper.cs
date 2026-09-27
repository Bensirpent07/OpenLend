using OpenLend.Catalog.Api.Dtos.CatalogItems;
using OpenLend.Catalog.Domain.CatalogItems;

using Riok.Mapperly.Abstractions;

namespace OpenLend.Catalog.Api.Mappers;

[Mapper]
public static partial class CatalogItemMapper
{
    public static partial CreateCatalogItemResponse ToCreateResponse(CatalogItem item);
}
