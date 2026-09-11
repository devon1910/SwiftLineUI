using System.Text.Json;
using System.Text.Json.Serialization;

namespace Domain.DTOs.Responses;

/// <summary>
/// Public event bigint fields remain JSON number tokens for compatibility with
/// the existing API. They are limited to JavaScript's exact integer range so
/// Next.js cannot silently round them or change their JSON type.
/// </summary>
public static class PublicEventJsonIntegerPolicy
{
    public const long MaxSafeInteger = 9_007_199_254_740_991L;
    public const long MinSafeInteger = -MaxSafeInteger;

    public static long Validate(long value)
    {
        if (value < MinSafeInteger || value > MaxSafeInteger)
        {
            throw new JsonException("Public event integer exceeds the safe JSON integer range");
        }

        return value;
    }
}

public sealed class PublicEventJsonLongConverter : JsonConverter<long>
{
    public override long Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType != JsonTokenType.Number || !reader.TryGetInt64(out var value))
        {
            throw new JsonException("Public event integer must be a JSON number representing a 64-bit integer");
        }

        return PublicEventJsonIntegerPolicy.Validate(value);
    }

    public override void Write(Utf8JsonWriter writer, long value, JsonSerializerOptions options)
    {
        writer.WriteNumberValue(PublicEventJsonIntegerPolicy.Validate(value));
    }
}

/// <summary>
/// The deliberately small public item returned by Event/SearchEvents.
/// Keep this separate from <see cref="Domain.Models.Event"/> so persistence
/// fields and navigation properties cannot accidentally become API fields.
/// </summary>
public record PublicSearchEventRes(
    [property: JsonPropertyName("id")]
    [property: JsonConverter(typeof(PublicEventJsonLongConverter))]
    long Id,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("averageTime")] int AverageTime,
    [property: JsonPropertyName("eventStartTime")] TimeOnly EventStartTime,
    [property: JsonPropertyName("eventEndTime")] TimeOnly EventEndTime,
    [property: JsonPropertyName("usersInQueue")] int UsersInQueue,
    [property: JsonPropertyName("organizer")] string Organizer,
    [property: JsonPropertyName("hasStarted")] bool HasStarted,
    [property: JsonPropertyName("staffCount")] int StaffCount,
    [property: JsonPropertyName("isActive")] bool IsActive,
    [property: JsonPropertyName("allowAnonymousJoining")] bool AllowAnonymousJoining,
    [property: JsonPropertyName("enableGeographicRestriction")] bool EnableGeographicRestriction,
    [property: JsonPropertyName("radiusInMeters")] int? RadiusInMeters,
    [property: JsonPropertyName("address")] string? Address,
    [property: JsonPropertyName("canManage")] bool CanManage);

public record SearchEventsRes(
    [property: JsonPropertyName("events")] List<PublicSearchEventRes> Events,
    [property: JsonPropertyName("totalPages")] int TotalPages,
    [property: JsonPropertyName("isUserInQueue")] bool IsUserInQueue = false,
    [property: JsonPropertyName("lastEventJoined")]
    [property: JsonConverter(typeof(PublicEventJsonLongConverter))]
    long lastEventJoined = 0);
