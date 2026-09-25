using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using OpenLend.Catalog.Infrastructure.Persistence;

namespace OpenLend.Catalog.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        string connectionString)
    {
        services.AddDbContext<CatalogDbContext>(options => options.UseMySQL(connectionString));

        return services;
    }
}
