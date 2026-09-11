using Application.Services;
using Domain.DTOs.Requests;
using Domain.DTOs.Responses;
using Domain.Interfaces;
using NSubstitute;
using System.Text.Json;
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

        private static PublicSearchEventRes SearchEvent(
            long id = 1,
            string title = "Event",
            string description = "",
            string organizer = "Organizer",
            bool hasStarted = false,
            int staffCount = 1,
            bool isActive = true) => new(
                id,
                title,
                description,
                15,
                TimeOnly.Parse("15:00"),
                TimeOnly.Parse("14:00"),
                0,
                organizer,
                hasStarted,
                staffCount,
                isActive,
                false,
                false,
                null,
                null,
                false);

        #region Search Events

        [Fact]
        public void SearchEvents_UsesTheSafeCamelCaseContractInsideTheLegacyResultEnvelope()
        {
            var payload = new SearchEventsRes(
                new List<PublicSearchEventRes>
                {
                    SearchEvent(id: 42, title: "Contract fixture", organizer: "fixture-owner")
                },
                TotalPages: 1,
                IsUserInQueue: true,
                lastEventJoined: 42);

            var json = JsonSerializer.Serialize(
                Result<SearchEventsRes>.Ok(payload),
                new JsonSerializerOptions(JsonSerializerDefaults.Web));
            using var document = JsonDocument.Parse(json);
            var root = document.RootElement;
            var data = root.GetProperty("data");
            var item = data.GetProperty("events")[0];

            Assert.Equal(
                new[] { "data", "message", "status" },
                root.EnumerateObject().Select(property => property.Name));
            Assert.Equal(
                new[] { "events", "isUserInQueue", "lastEventJoined", "totalPages" },
                data.EnumerateObject().Select(property => property.Name).OrderBy(name => name));
            Assert.Equal(
                new[]
                {
                    "address",
                    "allowAnonymousJoining",
                    "averageTime",
                    "canManage",
                    "description",
                    "enableGeographicRestriction",
                    "eventEndTime",
                    "eventStartTime",
                    "hasStarted",
                    "id",
                    "isActive",
                    "organizer",
                    "radiusInMeters",
                    "staffCount",
                    "title",
                    "usersInQueue"
                },
                item.EnumerateObject().Select(property => property.Name).OrderBy(name => name));
            Assert.Equal("Contract fixture", item.GetProperty("title").GetString());
            Assert.Equal("fixture-owner", item.GetProperty("organizer").GetString());
            Assert.Equal(42, item.GetProperty("id").GetInt64());
            Assert.Equal(42, data.GetProperty("lastEventJoined").GetInt64());
            Assert.False(item.TryGetProperty("createdBy", out _));
            Assert.False(item.TryGetProperty("isDeleted", out _));
            Assert.False(item.TryGetProperty("swiftLineUser", out _));
        }

        [Fact]
        public async Task SearchEvents_ReturnsExpectedResult_WhenQueryIsEmpty()
        {
            // Arrange
            var page = 1;
            var size = 10;
            var query = "";
            var userId = "user123";

            var mockResult = new SearchEventsRes(
                new List<PublicSearchEventRes>
                {
                    SearchEvent(id: 1, title: "Swift Summit", organizer: "Alice")
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
                new List<PublicSearchEventRes>(),
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

            var eventList = new List<PublicSearchEventRes>();
            for (int i = 0; i < size; i++)
            {
                eventList.Add(SearchEvent(id: i + 1, title: $"Event {i + 1}"));
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
                new List<PublicSearchEventRes>
                {
                    SearchEvent(
                        id: 2,
                        title: "SwiftLine Launch",
                        description: "Big launch!",
                        organizer: "John Doe",
                        hasStarted: true,
                        staffCount: 5)
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
