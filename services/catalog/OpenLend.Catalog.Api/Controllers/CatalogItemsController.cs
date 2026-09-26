using Microsoft.AspNetCore.Mvc;

using OpenLend.Catalog.Api.Contracts.CatalogItems;
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

        var response = new CreateCatalogItemResponse(
            item.Id,
            item.Name,
            item.Description,
            item.IsActive,
            item.CreatedAtUtc);

        return Created($"/api/catalog/items/{item.Id}", response);
    }
}
