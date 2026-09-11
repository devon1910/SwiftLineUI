using System.Text.Json.Serialization;

namespace Domain.DTOs.Responses;

public record PublicEventRes(
    [property: JsonConverter(typeof(PublicEventJsonLongConverter))]
    long Id,
    string Title,
    string Description,
    int AverageTime,
    TimeOnly EventStartTime,
    TimeOnly EventEndTime,
    int Capacity,
    int StaffCount,
    int UsersInQueue,
    bool IsActive,
    bool AllowAnonymousJoining,
    bool AllowAutomaticSkips,
    bool EnableGeographicRestriction,
    string? Address,
    decimal? Latitude,
    decimal? Longitude,
    int? RadiusInMeters,
    string Organizer,
    bool CanManage);
