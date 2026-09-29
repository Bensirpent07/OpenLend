using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Microsoft.EntityFrameworkCore;

using OpenLend.Catalog.Api.Dtos.CatalogItems;
using OpenLend.Catalog.Api.Mappers;
using OpenLend.Catalog.Infrastructure.Persistence;

namespace OpenLend.Catalog.Api.Controllers;

[Route("odata/CatalogItems")]
public sealed class CatalogItemsODataController(CatalogDbContext dbContext) : ODataController
{
    [HttpGet]
    [EnableQuery]
    public IQueryable<CatalogItemResponse> Get()
    {
        return CatalogItemMapper.ToResponse(dbContext.CatalogItems.AsNoTracking());
    }
}
