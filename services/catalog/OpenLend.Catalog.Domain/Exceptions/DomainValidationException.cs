namespace OpenLend.Catalog.Domain.Exceptions;

public sealed class DomainValidationException(
    string message,
    string? paramName = null) : ArgumentException(message, paramName)
{
}
