using Microsoft.AspNetCore.OData;
using Microsoft.OData.ModelBuilder;

using OpenLend.Catalog.Api.Dtos.CatalogItems;
using OpenLend.Catalog.Application.CatalogItems;
using OpenLend.Catalog.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var catalogConnectionString =
    builder.Configuration.GetConnectionString("CatalogDatabase")
    ?? throw new InvalidOperationException("Connection string 'CatalogDatabase' was not found.");

builder.Services.AddInfrastructure(catalogConnectionString);
builder.Services.AddScoped<CatalogItemService>();
builder.Services.AddProblemDetails();

var odataModelBuilder = new ODataConventionModelBuilder()
    .EnableLowerCamelCase();

odataModelBuilder.EntitySet<CatalogItemResponse>("CatalogItems");

builder.Services
    .AddControllers()
    .AddOData(options =>
    {
        options
            .Select()
            .Filter()
            .OrderBy()
            .Count()
            .SetMaxTop(100);

        options.AddRouteComponents(
            "odata",
            odataModelBuilder.GetEdmModel());
    });
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseExceptionHandler();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program
{
}