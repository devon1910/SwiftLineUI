using Application.Services;
using Domain.Interfaces;
using NSubstitute;

namespace ServiceUnitTests;

public class EventRequestValidationTests
{
    [Fact]
    public async Task GetEvent_RejectsNonPositiveIdsBeforeRepositoryAccess()
    {
        var eventRepo = Substitute.For<IEventRepo>();
        var service = new EventService(eventRepo);

        var result = await service.GetEvent(0);

        Assert.False(result.Status);
        Assert.Equal(400, result.StatusCode);
        await eventRepo.DidNotReceive().GetEvent(Arg.Any<long>());
    }

    [Theory]
    [InlineData(0, 20)]
    [InlineData(1, 101)]
    public async Task SearchEvents_RejectsInvalidPageOrSizeBeforeRepositoryAccess(int page, int size)
    {
        var eventRepo = Substitute.For<IEventRepo>();
        var service = new EventService(eventRepo);

        var result = await service.SearchEvents(page, size, "", null);

        Assert.False(result.Status);
        Assert.Equal(400, result.StatusCode);
        await eventRepo.DidNotReceive().SearchEvents(
            Arg.Any<int>(),
            Arg.Any<int>(),
            Arg.Any<string>(),
            Arg.Any<string?>());
    }
}
