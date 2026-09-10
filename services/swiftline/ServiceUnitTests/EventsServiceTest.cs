using Application.Services;
using Domain.DTOs.Requests;
using Domain.DTOs.Responses;
using Domain.Interfaces;
using Domain.Models;
using NSubstitute;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ServiceUnitTests
{
    public class EventsServiceTest
    {
        private readonly IEventService _eventService;
        private readonly IEventRepo _eventsRepoMock;

        public EventsServiceTest()
        {
            _eventsRepoMock = Substitute.For<IEventRepo>();
            _eventService = new EventService(_eventsRepoMock);
        }

        #region Search Events

        [Fact]
        public async Task SearchEvents_ReturnsExpectedResult_WhenQueryIsEmpty()
        {
            // Arrange
            var page = 1;
            var size = 10;
            var query = "";
            var userId = "user123";

            var mockResult = new SearchEventsRes(
                new List<Event>
                {
                new Event { 
                    Id = 1, 
                    Title = "Swift Summit", 
                    Organizer = "Alice", 
                    HasStarted = false,
                    EventEndTime= TimeOnly.Parse("14:00"),
                    EventStartTime = TimeOnly.Parse("15:00"),
                    }
                },
                TotalPages: 1,
                IsUserInQueue: true,
                lastEventJoined: 1
               
            );

            _eventsRepoMock.SearchEvents(page, size, query, userId).Returns(mockResult);

            // Act
            var result = await _eventService.SearchEvents(page, size, query, userId);

            // Assert
            Assert.Single(result.Data.Events);
            Assert.Equal(1, result.Data.TotalPages);
            Assert.True(result.Data.IsUserInQueue);
            Assert.Equal(1, result.Data.lastEventJoined);
            Assert.Equal("Swift Summit", result.Data.Events[0].Title);
        }

        [Fact]
        public async Task SearchEvents_ReturnsEmptyResult_WhenNoEventsMatch()
        {
            // Arrange
            var page = 1;
            var size = 5;
            var query = "nonexistent";
            var userId = "user456";

            var mockResult = new SearchEventsRes(
                new List<Event>(),
                TotalPages: 0,
                IsUserInQueue: false,
                lastEventJoined: 0
            );

            _eventsRepoMock.SearchEvents(page, size, query, userId).Returns(mockResult);

            // Act
            var result = await _eventService.SearchEvents(page, size, query, userId);

            // Assert
            Assert.Empty(result.Data.Events);
            Assert.Equal(0, result.Data.TotalPages);
            Assert.False(result.Data.IsUserInQueue);
            Assert.Equal(0, result.Data.lastEventJoined);
        }

        [Theory]
        [InlineData(1, 5, 10, 2)]
        [InlineData(2, 5, 10, 2)]
        [InlineData(1, 10, 10, 1)]
        public async Task SearchEvents_CalculatesCorrectPageCount(int page, int size, int totalEvents, int expectedPageCount)
        {
            // Arrange
            var query = "";
            var userId = "user789";

            var eventList = new List<Event>();
            for (int i = 0; i < size; i++)
            {
                eventList.Add(new Event {
                    Id = i + 1, 
                    Title = $"Event {i + 1}", 
                    Organizer = "Organizer",
                    EventEndTime = TimeOnly.Parse("12:00"),
                    EventStartTime = TimeOnly.Parse("15:00")
                });
            }

            var mockResult = new SearchEventsRes(
                eventList,
                TotalPages: expectedPageCount,
                IsUserInQueue: false,
                lastEventJoined: 0
            );

            _eventsRepoMock.SearchEvents(page, size, query, userId).Returns(mockResult);

            // Act
            var result = await _eventService.SearchEvents(page, size, query, userId);

            // Assert
            Assert.Equal(expectedPageCount, result.Data.TotalPages);
            Assert.Equal(size, result.Data.Events.Count);
        }

        [Fact]
        public async Task SearchEvents_ReturnsEventDetailsCorrectly()
        {
            // Arrange
            var page = 1;
            var size = 1;
            var query = "Swift";
            var userId = "userXYZ";

            var mockResult = new SearchEventsRes(
                new List<Event>
                {
                new Event
                {
                    Id = 2,
                    Title = "SwiftLine Launch",
                    Description = "Big launch!",
                    Organizer = "John Doe",
                    HasStarted = true,
                    StaffCount = 5,
                    IsActive = true,
                    EventEndTime = TimeOnly.Parse("12:00"),
                    EventStartTime = TimeOnly.Parse("15:00"),
                }
                },
                TotalPages: 1,
                IsUserInQueue: true,
                lastEventJoined: 2
            );

            _eventsRepoMock.SearchEvents(page, size, query, userId).Returns(mockResult);

            // Act
            var result = await _eventService.SearchEvents(page, size, query, userId);

            // Assert
            Assert.Single(result.Data.Events);
            var evt = result.Data.Events[0];
            Assert.Equal("SwiftLine Launch", evt.Title);
            Assert.Equal("John Doe", evt.Organizer);
            Assert.True(evt.HasStarted);
            Assert.Equal(5, evt.StaffCount);
            Assert.True(evt.IsActive);
        }

        #endregion  

        #region Create Event
        [Fact]
        public async Task CreateEvent_ReturnsFailure_WhenRepositoryRejectsRequest()
        {
            // Arrange
            var userId = "user123";
            var request = new CreateEventModel
            {
                Title = "SwiftLine Demo",
                Description = "Test event",
                AverageTime = 5,
                EventStartTime = "09:00",
                EventEndTime = "12:00",
                StaffCount = 2,
                Capacity = 100,
                AllowAnonymousJoining = true
            };

            _eventsRepoMock.CreateEvent(userId, request).Returns(false);

            // Act
            var result = await _eventService.CreateEvent(userId, request);

            // Assert
            Assert.False(result.Status);
            Assert.False(result.Data);
            Assert.Equal("Unable to create event Queue. Event already exists or ensure that you're creating the event correctly.", result.Message);
            await _eventsRepoMock.Received(1).CreateEvent(userId, request);
        }

        [Fact]
        public async Task CreateEvent_ReturnsSuccess_AndForwardsRequest_WhenRepositoryCreatesEvent()
        {
            // Arrange
            var userId = "user456";
            var request = new CreateEventModel
            {
                Title = "New Event 2",
                Description = "Real event",
                AverageTime = 10,
                EventStartTime = "08:00",
                EventEndTime = "10:00",
                StaffCount = 3,
                Capacity = 50,
                AllowAnonymousJoining = false
            };

            _eventsRepoMock.CreateEvent(userId, request).Returns(true);

            // Act
            var result = await _eventService.CreateEvent(userId, request);

            // Assert
            Assert.True(result.Status);
            Assert.True(result.Data);
            Assert.Equal("New Event Created", result.Message);
            await _eventsRepoMock.Received(1).CreateEvent(userId, request);
        }
        #endregion

        //[Fact]
        //public async Task CreateEvent_ShouldReturnSuccess_WhenEventIsCreated()
        //{
        //    // Arrange
        //    var userId = "user123";
        //    var createEventModel = new CreateEventModel
        //    {
        //        Title = "Test Event",
        //        Description = "This is a test event",
        //        Date = DateTime.Now.AddDays(1),
        //        Location = "Test Location"
        //    };
        //    _eventsRepoMock.CreateEvent(userId, createEventModel).Returns(true);
        //    // Act
        //    var result = await _eventService.CreateEvent(userId, createEventModel);
        //    // Assert
        //    Assert.True(result.Status);
        //    Assert.Equal("Operation completed successfully", result.Message);
        //}
        //[Fact]
        //public async Task EditEvent_ShouldReturnSuccess_WhenEventIsEdited()
        //{
        //    // Arrange
        //    var editEventReq = new EditEventReq
        //    {
        //        EventId = 1,
        //        Title = "Updated Event",
        //        Description = "This is an updated test event",
        //        Date = DateTime.Now.AddDays(2),
        //        Location = "Updated Location"
        //    };
        //    _eventsRepoMock.EditEvent(editEventReq).Returns(true);
        //    // Act
        //    var result = await _eventService.EditEvent(editEventReq);
        //    // Assert
        //    Assert.True(result.Status);
        //    Assert.Equal("Operation completed successfully", result.Message);
        //}

    }
}
