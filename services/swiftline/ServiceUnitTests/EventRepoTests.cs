using Domain.DTOs.Requests;
using Domain.Interfaces;
using Domain.Models;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace ServiceUnitTests;

public class EventRepoTests
{
    [Fact]
    public async Task CreateEvent_ParsesTimeCorrectly_WhenValidTimesProvided()
    {
        await using var context = CreateContext();
        var repository = CreateRepository(context);
        var request = new CreateEventModel
        {
            Title = "Timed Event",
            Description = "With times",
            AverageTime = 15,
            EventStartTime = "14:30",
            EventEndTime = "16:30",
            StaffCount = 4,
            Capacity = 60,
            AllowAnonymousJoining = true,
            AllowAutomaticSkips = false,
            EnableGeographicRestriction = true,
            Address = "10 Queue Street",
            Latitude = 6.5244m,
            Longitude = 3.3792m,
            RadiusInMeters = 500
        };

        var result = await repository.CreateEvent("time-user", request);

        Assert.True(result);
        var persistedEvent = await context.Events.SingleAsync();
        Assert.Equal(TimeOnly.Parse("14:30"), persistedEvent.EventStartTime);
        Assert.Equal(TimeOnly.Parse("16:30"), persistedEvent.EventEndTime);
        Assert.Equal(request.Title, persistedEvent.Title);
        Assert.Equal(request.Description, persistedEvent.Description);
        Assert.Equal(request.AverageTime, persistedEvent.AverageTime);
        Assert.Equal(request.AverageTime * 60, persistedEvent.AverageTimeToServeSeconds);
        Assert.Equal(request.StaffCount, persistedEvent.StaffCount);
        Assert.Equal(request.Capacity, persistedEvent.Capacity);
        Assert.Equal(request.AllowAnonymousJoining, persistedEvent.AllowAnonymousJoining);
        Assert.Equal(request.AllowAutomaticSkips, persistedEvent.AllowAutomaticSkips);
        Assert.Equal(request.EnableGeographicRestriction, persistedEvent.EnableGeographicRestriction);
        Assert.Equal(request.Address, persistedEvent.Address);
        Assert.Equal(request.Latitude, persistedEvent.Latitude);
        Assert.Equal(request.Longitude, persistedEvent.Longitude);
        Assert.Equal(request.RadiusInMeters, persistedEvent.RadiusInMeters);
        Assert.Equal("time-user", persistedEvent.CreatedBy);
    }

    [Fact]
    public async Task CreateEvent_UsesDefaultTime_WhenInvalidTimesProvided()
    {
        await using var context = CreateContext();
        var repository = CreateRepository(context);
        var request = new CreateEventModel
        {
            Title = "Broken Event",
            Description = "Invalid times",
            AverageTime = 10,
            EventStartTime = "notatime",
            EventEndTime = "alsonotatime",
            StaffCount = 2,
            Capacity = 20,
            AllowAnonymousJoining = false
        };

        var result = await repository.CreateEvent("invalid-time-user", request);

        Assert.True(result);
        var persistedEvent = await context.Events.SingleAsync();
        Assert.Equal(default, persistedEvent.EventStartTime);
        Assert.Equal(default, persistedEvent.EventEndTime);
        Assert.Equal(request.Capacity, persistedEvent.Capacity);
    }

    [Fact]
    public async Task CreateEvent_RejectsDuplicateTitle_WithoutCreatingAnotherEvent()
    {
        await using var context = CreateContext();
        var repository = CreateRepository(context);
        var request = new CreateEventModel
        {
            Title = "One Event Only",
            Description = "Duplicate guard",
            AverageTime = 5,
            EventStartTime = "09:00",
            EventEndTime = "12:00",
            StaffCount = 2,
            Capacity = 25
        };

        var firstResult = await repository.CreateEvent("creator", request);
        var secondResult = await repository.CreateEvent("creator", request);

        Assert.True(firstResult);
        Assert.False(secondResult);
        Assert.Equal(1, await context.Events.CountAsync(x => x.Title == request.Title));
    }

    [Fact]
    public async Task ExitQueue_DoesNotProcessLineFromAnotherEvent()
    {
        await using var context = CreateContext();
        var line = new Line
        {
            Id = 11,
            UserId = "attendee",
            EventId = 101,
            IsAttendedTo = false,
            Status = "pending"
        };
        context.Lines.Add(line);
        await context.SaveChangesAsync();

        var lineRepository = Substitute.For<ILineRepo>();
        var notifier = Substitute.For<ISignalRNotifierRepo>();
        var repository = CreateRepository(context, lineRepository, notifier);

        var result = await repository.ExitQueue(
            "attendee",
            line.Id,
            eventId: 202);

        Assert.False(result);
        await lineRepository.DidNotReceive().MarkUserAsServed(
            Arg.Any<Line>(),
            Arg.Any<string>(),
            Arg.Any<string>());
        await notifier.DidNotReceive().BroadcastLineUpdate(
            Arg.Any<Line>(),
            Arg.Any<int>());
    }

    [Fact]
    public async Task ExitQueue_IsIdempotentForAnAttendedLine()
    {
        await using var context = CreateContext();
        var line = new Line
        {
            Id = 12,
            UserId = "attendee",
            EventId = 303,
            IsAttendedTo = false,
            Status = "pending"
        };
        context.Lines.Add(line);
        await context.SaveChangesAsync();

        var lineRepository = Substitute.For<ILineRepo>();
        lineRepository.MarkUserAsServed(
                Arg.Any<Line>(),
                "left",
                "")
            .Returns(true);
        lineRepository.Notify2ndLineMember(Arg.Any<Line>())
            .Returns(Task.CompletedTask);

        var notifier = Substitute.For<ISignalRNotifierRepo>();
        notifier.BroadcastLineUpdate(Arg.Any<Line>(), Arg.Any<int>())
            .Returns(Task.CompletedTask);

        var repository = CreateRepository(context, lineRepository, notifier);

        var firstResult = await repository.ExitQueue(
            "attendee",
            line.Id,
            eventId: line.EventId);

        line.IsAttendedTo = true;
        await context.SaveChangesAsync();

        var secondResult = await repository.ExitQueue(
            "attendee",
            line.Id,
            eventId: line.EventId);

        Assert.True(firstResult);
        Assert.False(secondResult);
        await lineRepository.Received(1).MarkUserAsServed(
            Arg.Is<Line>(candidate => candidate.Id == line.Id && candidate.EventId == line.EventId),
            "left",
            "");
        await notifier.Received(1).BroadcastLineUpdate(
            Arg.Is<Line>(candidate => candidate.Id == line.Id && candidate.EventId == line.EventId),
            -1);
    }

    [Fact]
    public async Task ExitQueue_DoesNotNotify_WhenAtomicClaimLosesRace()
    {
        await using var context = CreateContext();
        var line = new Line
        {
            Id = 13,
            UserId = "attendee",
            EventId = 404,
            IsAttendedTo = false,
            Status = "pending"
        };
        context.Lines.Add(line);
        await context.SaveChangesAsync();

        var lineRepository = Substitute.For<ILineRepo>();
        lineRepository.MarkUserAsServed(Arg.Any<Line>(), "left", "")
            .Returns(false);
        var notifier = Substitute.For<ISignalRNotifierRepo>();
        var repository = CreateRepository(context, lineRepository, notifier);

        var result = await repository.ExitQueue("attendee", line.Id, eventId: line.EventId);

        Assert.False(result);
        await notifier.DidNotReceive().BroadcastLineUpdate(Arg.Any<Line>(), Arg.Any<int>());
        await lineRepository.DidNotReceive().Notify2ndLineMember(Arg.Any<Line>());
    }

    private static SwiftLineDatabaseContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<SwiftLineDatabaseContext>()
            .UseInMemoryDatabase($"swiftline-tests-{Guid.NewGuid():N}")
            .Options;

        return new SwiftLineDatabaseContext(options);
    }

    private static EventRepo CreateRepository(
        SwiftLineDatabaseContext context,
        ILineRepo? lineRepository = null,
        ISignalRNotifierRepo? notifier = null)
    {
        return new EventRepo(
            context,
            lineRepository ?? Substitute.For<ILineRepo>(),
            notifier ?? Substitute.For<ISignalRNotifierRepo>(),
            Substitute.For<IAuthRepo>());
    }
}
