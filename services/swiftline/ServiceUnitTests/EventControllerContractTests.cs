using Domain.DTOs.Responses;
using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using NSubstitute;
using SwiftLine.API.Controllers;

namespace ServiceUnitTests;

public class EventControllerContractTests
{
    [Theory]
    [InlineData(null)]
    [InlineData("abc")]
    public async Task GetEvent_ReturnsBadRequest_ForMissingOrMalformedEventId(string? eventId)
    {
        var eventService = Substitute.For<IEventService>();
        var controller = new EventController(eventService);

        var action = await controller.GetEvent(eventId);

        var result = Assert.IsType<ObjectResult>(action.Result);
        var body = Assert.IsType<Result<PublicEventRes>>(result.Value);
        Assert.Equal(400, result.StatusCode);
        Assert.False(body.Status);
        Assert.Null(body.Data);
        await eventService.DidNotReceive().GetEvent(Arg.Any<long>());
    }

    [Theory]
    [InlineData(0, 20)]
    [InlineData(1, 101)]
    public async Task SearchEvents_ReturnsBadRequest_ForInvalidPageOrSize(int page, int size)
    {
        var eventService = Substitute.For<IEventService>();
        var controller = new EventController(eventService);

        var action = await controller.SearchEvents(page, size);

        var result = Assert.IsType<ObjectResult>(action.Result);
        var body = Assert.IsType<Result<SearchEventsRes>>(result.Value);
        Assert.Equal(400, result.StatusCode);
        Assert.False(body.Status);
        Assert.Null(body.Data);
        await eventService.DidNotReceive().SearchEvents(
            Arg.Any<int>(),
            Arg.Any<int>(),
            Arg.Any<string>(),
            Arg.Any<string?>());
    }
}
