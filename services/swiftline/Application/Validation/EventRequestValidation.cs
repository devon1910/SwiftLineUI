using System.Globalization;

namespace Application.Validation;

public static class EventRequestValidation
{
    public const int MinPage = 1;
    public const int MaxPage = 10_000;
    public const int MinPageSize = 1;
    public const int MaxPageSize = 100;

    public const string InvalidEventIdMessage = "eventId must be a positive integer";

    public static bool TryParseEventId(string? rawValue, out long eventId)
    {
        eventId = 0;
        var value = rawValue?.Trim();

        return !string.IsNullOrEmpty(value)
            && long.TryParse(value, NumberStyles.None, CultureInfo.InvariantCulture, out eventId)
            && IsValidEventId(eventId);
    }

    public static bool IsValidEventId(long eventId) => eventId > 0;

    public static bool IsValidSearchPagination(int page, int size) =>
        page >= MinPage
        && page <= MaxPage
        && size >= MinPageSize
        && size <= MaxPageSize;

    public static string InvalidPageMessage(int page) =>
        $"Page must be between {MinPage} and {MaxPage}";

    public static string InvalidSizeMessage(int size) =>
        $"Size must be between {MinPageSize} and {MaxPageSize}";
}
