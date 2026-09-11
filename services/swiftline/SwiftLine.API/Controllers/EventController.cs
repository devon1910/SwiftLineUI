using Application.Services;
using Domain.Constants;
using Application.Validation;
using Domain.DTOs.Requests;
using Domain.DTOs.Responses;
using Domain.Interfaces;
using Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SwiftLine.API.Extensions;

namespace SwiftLine.API.Controllers
{
    [Authorize(Roles = $"{Roles.Admin},{Roles.User}")]
    public class EventController(IEventService eventService) : BaseController
    {
        private async Task<bool> IsOrganizerAsync(long eventId)
        {
            var result = await eventService.GetEvent(eventId);
            return result.Status && result.Data?.CreatedBy == UserId;
        }

        [HttpPost()]
        public async Task<ActionResult<Result<bool>>> CreateEvent(CreateEventModel request)
        {
            
            var res = await eventService.CreateEvent(UserId,request);
            return res.ToActionResult();
        }

      
        [HttpGet, AllowAnonymous]
        public async Task<ActionResult<Result<PublicEventRes>>> GetEvent([FromQuery] string? eventId)
        {
            if (!EventRequestValidation.TryParseEventId(eventId, out var parsedEventId))
            {
                return Result<PublicEventRes>.Failed(EventRequestValidation.InvalidEventIdMessage).ToActionResult();
            }

            var res = await eventService.GetEvent(parsedEventId);
            if (!res.Status || res.Data is null)
                return Result<PublicEventRes>.NotFound(res.Message ?? "Event not found").ToActionResult();

            var e = res.Data;
            return Result<PublicEventRes>.Ok(new PublicEventRes(
                e.Id, e.Title, e.Description, e.AverageTime, e.EventStartTime,
                e.EventEndTime, e.Capacity, e.StaffCount, e.UsersInQueue,
                e.IsActive, e.AllowAnonymousJoining, e.AllowAutomaticSkips,
                e.EnableGeographicRestriction, e.Address, e.Latitude, e.Longitude, e.RadiusInMeters,
                e.SwiftLineUser?.UserName ?? e.Organizer ?? "SwiftLine organizer",
                !string.IsNullOrEmpty(UserId) && e.CreatedBy == UserId))
                .ToActionResult();
        }

      
        [HttpPut]
        public async Task<ActionResult<Result<bool>>> EditEvent(EditEventReq req)
        {
            if (!await IsOrganizerAsync(req.EventId)) return Forbid();
            var res = await eventService.EditEvent(req);
            return res.ToActionResult();
        }
       
        [HttpGet()]
        public async Task<ActionResult<Result<EventQueueRes>>> GetEventQueue(int CurrentMembersPage,int PastMembersPage, int Size, long EventId)
        {
            if (!await IsOrganizerAsync(EventId)) return Forbid();
            var res = await eventService.GetEventQueue(CurrentMembersPage, PastMembersPage, Size,EventId);
            return res.ToActionResult();
        }
        [HttpGet]
        public async Task<ActionResult<Result<GetUserEventsRes>>> GetUserEvents()
        {
            var res = await eventService.GetUserEvents(UserId);
            return res.ToActionResult();
        }
        
        [HttpDelete("{Id}")]
        public async Task<ActionResult<Result<bool>>> DeleteEvent(long Id)
        {
            if (!await IsOrganizerAsync(Id)) return Forbid();
            var res =eventService.DeleteEvent(Id);
            return res.ToActionResult();
        }

        [HttpGet, AllowAnonymous]
        public async Task<ActionResult<Result<SearchEventsRes>>> SearchEvents(int Page, int Size, string Query="")
        {
            if (!EventRequestValidation.IsValidSearchPagination(Page, Size))
            {
                var message = Page is < EventRequestValidation.MinPage or > EventRequestValidation.MaxPage
                    ? EventRequestValidation.InvalidPageMessage(Page)
                    : EventRequestValidation.InvalidSizeMessage(Size);

                return Result<SearchEventsRes>.Failed(message).ToActionResult();
            }

            var res = await eventService.SearchEvents(Page,Size,Query, UserId);

            return res.ToActionResult();
        }



    }
}
