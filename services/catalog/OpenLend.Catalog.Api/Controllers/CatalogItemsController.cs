using Microsoft.AspNetCore.Mvc;

using OpenLend.Catalog.Api.Dtos.CatalogItems;
using OpenLend.Catalog.Api.Mappers;
using OpenLend.Catalog.Application.CatalogItems;

namespace OpenLend.Catalog.Api.Controllers;

[Route("api/catalog/items")]
[ApiController]
public sealed class CatalogItemsController(CatalogItemService service) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<CreateCatalogItemResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<CreateCatalogItemResponse>> CreateAsync(CreateCatalogItemRequest request, CancellationToken ct)
    {
        var item = await service.CreateAsync(request.Name, request.Description, ct);

        var response = CatalogItemMapper.ToCreateResponse(item);

        return Created($"/api/catalog/items/{item.Id}", response);
    }
}
