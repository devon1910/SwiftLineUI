using System.Text.Json;
using System.Text.Json.Nodes;
using Domain.DTOs.Responses;

namespace ServiceUnitTests;

public class EventContractSerializationTests
{
    private static readonly JsonSerializerOptions WebJsonOptions =
        new(JsonSerializerDefaults.Web);

    [Fact]
    public void SearchEvents_SerializesToTheSharedCapturedFixture()
    {
        var payload = new SearchEventsRes(
            [
                new PublicSearchEventRes(
                    PublicEventJsonIntegerPolicy.MaxSafeInteger,
                    "Cross-runtime fixture",
                    "One captured event",
                    15,
                    TimeOnly.Parse("09:00:00"),
                    TimeOnly.Parse("17:00:00"),
                    4,
                    "fixture-owner@example.test",
                    true,
                    2,
                    true,
                    true,
                    false,
                    250,
                    "Queue Street",
                    true)
            ],
            TotalPages: 1,
            IsUserInQueue: true,
            lastEventJoined: PublicEventJsonIntegerPolicy.MaxSafeInteger - 1);

        var actualJson = JsonSerializer.Serialize(Result<SearchEventsRes>.Ok(payload), WebJsonOptions);
        var expectedJson = File.ReadAllText(
            Path.Combine(AppContext.BaseDirectory, "Fixtures", "search-events.json"));

        Assert.True(
            JsonNode.DeepEquals(JsonNode.Parse(expectedJson), JsonNode.Parse(actualJson)),
            $"Expected shared fixture {expectedJson} but received {actualJson}");

        using var document = JsonDocument.Parse(actualJson);
        var data = document.RootElement.GetProperty("data");
        Assert.Equal(JsonValueKind.Number, data.GetProperty("events")[0].GetProperty("id").ValueKind);
        Assert.Equal(JsonValueKind.Number, data.GetProperty("lastEventJoined").ValueKind);
        Assert.Equal(
            PublicEventJsonIntegerPolicy.MaxSafeInteger,
            data.GetProperty("events")[0].GetProperty("id").GetInt64());
        Assert.Equal(
            PublicEventJsonIntegerPolicy.MaxSafeInteger - 1,
            data.GetProperty("lastEventJoined").GetInt64());
    }

    [Fact]
    public void SearchEvents_RejectsLongIdBeyondSafeJsonIntegerRange()
    {
        var payload = new SearchEventsRes(
            [
                new PublicSearchEventRes(
                    PublicEventJsonIntegerPolicy.MaxSafeInteger + 1,
                    "Overflow",
                    "",
                    15,
                    TimeOnly.Parse("09:00:00"),
                    TimeOnly.Parse("17:00:00"),
                    0,
                    "organizer",
                    false,
                    1,
                    true,
                    false,
                    false,
                    null,
                    null,
                    false)
            ],
            TotalPages: 1,
            lastEventJoined: 0);

        Assert.Throws<JsonException>(() => JsonSerializer.Serialize(
            Result<SearchEventsRes>.Ok(payload),
            WebJsonOptions));
    }

    [Fact]
    public void SearchEvents_RejectsLastEventJoinedBeyondSafeJsonIntegerRange()
    {
        var payload = new SearchEventsRes(
            [],
            TotalPages: 0,
            lastEventJoined: PublicEventJsonIntegerPolicy.MaxSafeInteger + 1);

        Assert.Throws<JsonException>(() => JsonSerializer.Serialize(
            Result<SearchEventsRes>.Ok(payload),
            WebJsonOptions));
    }
}
