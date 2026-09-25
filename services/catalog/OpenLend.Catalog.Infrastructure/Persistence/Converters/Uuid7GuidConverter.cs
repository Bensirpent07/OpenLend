using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace OpenLend.Catalog.Infrastructure.Persistence.Converters;

public sealed class Uuid7GuidConverter : ValueConverter<Guid, byte[]>
{
    public Uuid7GuidConverter() : base(
        guid => guid.ToByteArray(bigEndian: true),
        bytes => new Guid(bytes, bigEndian: true))
    { }
}
