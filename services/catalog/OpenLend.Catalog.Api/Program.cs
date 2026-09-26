using OpenLend.Catalog.Application.CatalogItems;
using OpenLend.Catalog.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var catalogConnectionString =
    builder.Configuration.GetConnectionString("CatalogDatabase")
    ?? throw new InvalidOperationException(
        "Connection string 'CatalogDatabase' was not foind.");

builder.Services.AddInfrastructure(catalogConnectionString);
builder.Services.AddScoped<CatalogItemService>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
