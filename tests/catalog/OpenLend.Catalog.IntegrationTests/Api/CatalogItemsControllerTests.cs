using System.Net;
using System.Net.Http.Json;

using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using OpenLend.Catalog.Api.Contracts.CatalogItems;
using OpenLend.Catalog.Infrastructure.Persistence;

using Testcontainers.MySql;

namespace OpenLend.Catalog.IntegrationTests.Api;

public sealed class CatalogItemsControllerTests
{
    [Fact]
    public async Task Post_WithValidRequest_ReturnsCreatedAndPersistsItem()
    {
        var ct = TestContext.Current.CancellationToken;

        await using var mysql = new MySqlBuilder("mysql:8.4.11")
            .Build();

        await mysql.StartAsync(ct);

        using var factory = new CatalogApiFactory(mysql.GetConnectionString());

        using var scope = factory.Services.CreateScope();

        var dbContext = scope.ServiceProvider.GetRequiredService<CatalogDbContext>();

        await dbContext.Database.MigrateAsync(ct);

        using var client = factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                BaseAddress = new Uri("https://localhost")
            });

        var response = await client.PostAsJsonAsync(
            "/api/catalog/items",
            new
            {
                name = "Test Item",
                description = "Test Description"
            }, ct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var responseBody = await response.Content.ReadFromJsonAsync<CreateCatalogItemResponse>(cancellationToken: ct);
        Assert.NotNull(responseBody);
        Assert.NotEqual(Guid.Empty, responseBody.Id);
        Assert.Equal("Test Item", responseBody.Name);
        Assert.Equal("Test Description", responseBody.Description);
        Assert.True(responseBody.IsActive);

        Assert.Equal($"/api/catalog/items/{responseBody.Id}", response.Headers.Location?.ToString());

        dbContext.ChangeTracker.Clear();
        var item = await dbContext.CatalogItems.SingleAsync(ct);

        Assert.Equal("Test Item", item.Name);
        Assert.Equal("Test Description", item.Description);
        Assert.True(item.IsActive);
    }

    [Fact]
    public async Task Post_WithBlankName_ReturnsBadRequest()
    {
        var ct = TestContext.Current.CancellationToken;

        await using var mysql = new MySqlBuilder("mysql:8.4.11")
            .Build();

        await mysql.StartAsync(ct);

        using var factory =
            new CatalogApiFactory(mysql.GetConnectionString());

        using var scope = factory.Services.CreateScope();

        var dbContext =
            scope.ServiceProvider.GetRequiredService<CatalogDbContext>();

        await dbContext.Database.MigrateAsync(ct);

        using var client = factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                BaseAddress = new Uri("https://localhost")
            });

        var response = await client.PostAsJsonAsync(
            "/api/catalog/items",
            new
            {
                name = "   ",
                description = "Test Description"
            },
            ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        Assert.Empty(await dbContext.CatalogItems.ToListAsync(ct));
    }

    private sealed class CatalogApiFactory(string connectionString) : WebApplicationFactory<Program>
    {
        protected override IHost CreateHost(IHostBuilder builder)
        {
            builder.ConfigureHostConfiguration(configuartion => configuartion.AddInMemoryCollection(
                    new Dictionary<string, string?>
                    {
                        ["ConnectionStrings:CatalogDatabase"] = connectionString
                    }));

            return base.CreateHost(builder);
        }
    }
}
