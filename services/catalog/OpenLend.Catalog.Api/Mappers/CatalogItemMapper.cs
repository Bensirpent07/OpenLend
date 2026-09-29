using OpenLend.Catalog.Api.Dtos.CatalogItems;
using OpenLend.Catalog.Domain.CatalogItems;

using Riok.Mapperly.Abstractions;

namespace OpenLend.Catalog.Api.Mappers;

[Mapper]
public static partial class CatalogItemMapper
{
    public static partial CatalogItemResponse ToResponse(CatalogItem item);
    public static partial IQueryable<CatalogItemResponse> ToResponse(IQueryable<CatalogItem> items);
}
