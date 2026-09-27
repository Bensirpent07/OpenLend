using Ardalis.Result;
using Ardalis.Result.AspNetCore;

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
    public async Task<ActionResult<CreateCatalogItemResponse>> CreateAsync(
    CreateCatalogItemRequest request,
    CancellationToken ct)
    {
        var result = await service.CreateAsync(
            request.Name,
            request.Description,
            ct);

        var responseResult = result.Map(CatalogItemMapper.ToCreateResponse);

        if (!responseResult.IsSuccess)
        {
            return responseResult.ToActionResult(this);
        }

        var response = responseResult.Value;

        return Created($"/api/catalog/items/{response.Id}", response);
    }
}
