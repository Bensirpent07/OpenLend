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
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CatalogItemResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CatalogItemResponse>> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var result = await service.GetByIdAsync(id, ct);

        var responseResult = result.Map(CatalogItemMapper.ToResponse);

        if (!responseResult.IsSuccess)
        {
            return responseResult.ToActionResult(this);
        }

        var response = responseResult.Value;

        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType<CatalogItemResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<CatalogItemResponse>> CreateAsync(
    CreateCatalogItemRequest request,
    CancellationToken ct)
    {
        var result = await service.CreateAsync(
            request.Name,
            request.Description,
            ct);

        var responseResult = result.Map(CatalogItemMapper.ToResponse);

        if (!responseResult.IsSuccess)
        {
            return responseResult.ToActionResult(this);
        }

        var response = responseResult.Value;

        return Created($"/api/catalog/items/{response.Id}", response);
    }
}
