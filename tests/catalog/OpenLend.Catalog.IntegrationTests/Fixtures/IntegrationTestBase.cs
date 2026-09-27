namespace OpenLend.Catalog.IntegrationTests.Fixtures;

public abstract class IntegrationTestBase(CatalogIntegrationFixture fixture) : IAsyncLifetime
{
    protected CatalogIntegrationFixture Fixture { get; } = fixture;

    public async ValueTask InitializeAsync()
    {
        await Fixture.ResetDatabaseAsync();
    }

    public ValueTask DisposeAsync()
    {
        return ValueTask.CompletedTask;
    }
}
