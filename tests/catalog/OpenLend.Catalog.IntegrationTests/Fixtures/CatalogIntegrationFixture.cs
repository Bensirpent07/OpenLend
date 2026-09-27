using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

using OpenLend.Catalog.Infrastructure.Persistence;

using Respawn;
using Respawn.Graph;

using Testcontainers.MySql;

namespace OpenLend.Catalog.IntegrationTests.Fixtures;

public sealed class CatalogIntegrationFixture : IAsyncLifetime
{
    private readonly MySqlContainer _mysqlContainer = new MySqlBuilder("mysql:8.4.11").Build();
    private WebApplicationFactory<Program> _factory = null!;
    private Respawner _respawner = null!;

    public HttpClient Client { get; private set; } = null!;
    public string ConnectionString => _mysqlContainer.GetConnectionString();

    public async ValueTask InitializeAsync()
    {
        await _mysqlContainer.StartAsync();
        _factory = new CatalogApiFactory(ConnectionString);
        await using var dbContext = CreateDbContext();
        await dbContext.Database.MigrateAsync();
        await dbContext.Database.OpenConnectionAsync();

        _respawner = await Respawner.CreateAsync(
                dbContext.Database.GetDbConnection(),
                new RespawnerOptions
                {
                    DbAdapter = DbAdapter.MySql,
                    TablesToIgnore = [new Table("__EFMigrationsHistory")]
                }
            );

        Client = _factory.CreateClient(
                new WebApplicationFactoryClientOptions
                {
                    BaseAddress = new Uri("https://localhost")
                }
            );
    }

    public CatalogDbContext CreateDbContext()
    {
        var options =
            new DbContextOptionsBuilder<CatalogDbContext>()
                .UseMySQL(ConnectionString)
                .Options;

        return new CatalogDbContext(options);
    }

    public async Task ResetDatabaseAsync()
    {
        await using var dbContext = CreateDbContext();

        await dbContext.Database.OpenConnectionAsync();

        await _respawner.ResetAsync(
            dbContext.Database.GetDbConnection());
    }

    public async ValueTask DisposeAsync()
    {
        Client.Dispose();
        _factory.Dispose();

        await _mysqlContainer.DisposeAsync();
    }

    private sealed class CatalogApiFactory(string connectionString)
    : WebApplicationFactory<Program>
    {
        protected override IHost CreateHost(IHostBuilder builder)
        {
            builder.ConfigureHostConfiguration(configuration =>
            {
                configuration.AddInMemoryCollection(
                    new Dictionary<string, string?>
                    {
                        ["ConnectionStrings:CatalogDatabase"] =
                            connectionString
                    });
            });

            return base.CreateHost(builder);
        }
    }
}
