using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

using OpenLend.Catalog.Domain.Exceptions;

namespace OpenLend.Catalog.Api.ExceptionHandling;

public sealed class DomainValidationExceptionHandler(IProblemDetailsService problemDetailsService) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception,
        CancellationToken ct)
    {
        if (exception is not DomainValidationException validationException)
        {
            return false;
        }

        context.Response.StatusCode = StatusCodes.Status400BadRequest;
        var parameterName = validationException.ParamName ?? "domain";
        var problemDetails = new ValidationProblemDetails(
            new Dictionary<string, string[]>
            {
                [parameterName] = [validationException.Message]
            })
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Domain validation error",
            Instance = context.Request.Path
        };

        await problemDetailsService.WriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = problemDetails,
            Exception = exception
        });
        return true;
    }
}
