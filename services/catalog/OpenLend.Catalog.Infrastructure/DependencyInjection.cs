using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using OpenLend.Catalog.Application.CatalogItems;
using OpenLend.Catalog.Infrastructure.Persistence;
using OpenLend.Catalog.Infrastructure.Persistence.Repositories;

namespace OpenLend.Catalog.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        string connectionString)
    {
        services.AddDbContext<CatalogDbContext>(options => options.UseMySQL(connectionString));
        services.AddScoped<ICatalogItemRepository, CatalogItemRepository>();

        return services;
    }
}
