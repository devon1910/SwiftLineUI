using Application.Services;
using Domain.DTOs.Responses;
using Domain.Interfaces;
using Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace SwiftLine.API
{
    public class SwiftLineHub(ISignalRNotifier notifier, Lazy<IEventRepo> eventRepo) : Hub
    {
        private string GetAuthenticatedUserId()
        {
            if (Context.User?.Identity?.IsAuthenticated != true)
            {
                throw new HubException("Unauthorized");
            }

            var userId = Context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new HubException("Unauthorized: the NameIdentifier claim is required.");
            }

            return userId;
        }

        private async Task EnsureEventOwnershipAsync(string userId, long eventId)
        {
            Event? @event;
            try
            {
                @event = await eventRepo.Value.GetEvent(eventId);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Unable to verify ownership for organizer action on event {EventId}", eventId);
                throw new HubException("Organizer action rejected: event ownership could not be verified. Follow-up required: expose a reliable event ownership check before enabling this action.");
            }

            if (@event is null || !string.Equals(@event.CreatedBy, userId, StringComparison.Ordinal))
            {
                throw new HubException("Organizer action rejected: the authenticated user does not own this event.");
            }
        }

        [EnableRateLimiting("SignupPolicy")]
        public async Task<AuthRes> JoinQueueGroup(int eventId, string userId)
        {
            var authenticatedUserId = Context.User?.Identity?.IsAuthenticated == true
                ? GetAuthenticatedUserId()
                : string.Empty;
            if (string.IsNullOrEmpty(authenticatedUserId) && !string.IsNullOrEmpty(userId))
                throw new HubException("Anonymous callers cannot provide a user identity.");

            Log.Information("User {UserId} joining queue group for event {EventId}", authenticatedUserId, eventId);
            try
            {
                AuthRes result = await notifier.JoinQueueGroup(eventId, authenticatedUserId, Context.ConnectionId);           
                Log.Information("User {UserId} successfully joined queue group for event {EventId}", authenticatedUserId, eventId);
                return result;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error joining queue group for user {UserId} and event {EventId}", authenticatedUserId, eventId);
                throw;
            }
        }

        public override async Task OnConnectedAsync()
        {
            if (Context.User?.Identity?.IsAuthenticated == true)
            {
                var userId = GetAuthenticatedUserId();
                await notifier.OnConnectedAsync(Context.ConnectionId, userId);
                Log.Debug("User {UserId} connected with ConnectionId {ConnectionId}", userId, Context.ConnectionId);
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
           
            Log.Information("Client disconnected. ConnectionId: {ConnectionId}", Context.ConnectionId);
            try
            {
                await notifier.OnDisconnectedAsync(Context.ConnectionId);
                await base.OnDisconnectedAsync(exception);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error handling disconnection for connection {ConnectionId}", Context.ConnectionId);
                throw;
            }
        }

       
        //public async Task NotifyUserPositionChange(string userId, LineInfoRes lineInfoRes)
        //{
        //    Log.Information("Notifying user {UserId} of position change", userId);
        //    try
        //    {
        //        await notifier.NotifyUserPositionChange(userId, lineInfoRes);
        //    }
        //    catch (Exception ex)
        //    {
        //        Log.Error(ex, "Error notifying user {UserId} of position change", userId);
        //        throw;
        //    }
        //}

        [Authorize]
        public async Task ExitQueue(string userId, long lineMemberId, string adminId = "", int position=-1, string leaveQueueReason = "")
        {
            var authenticatedUserId = GetAuthenticatedUserId();

            Log.Information("User {UserId} exiting queue. LineMemberId: {LineMemberId}, AdminId: {AdminId}", 
                authenticatedUserId, lineMemberId, string.Empty);
            try
            {
                await notifier.ExitQueue(authenticatedUserId, 0, string.Empty, position, leaveQueueReason);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error exiting queue for user {UserId}, LineMemberId: {LineMemberId}", 
                    authenticatedUserId, lineMemberId);
                throw;
            }
        }

        [Authorize]
        public async Task ServeQueueMember(long eventId, long lineMemberId, int position = -1)
        {
            var organizerId = GetAuthenticatedUserId();
            await EnsureEventOwnershipAsync(organizerId, eventId);
            await notifier.ExitQueue(string.Empty, lineMemberId, organizerId, position, string.Empty, eventId);
        }

        [Authorize]
        public async Task ToggleQueueActivity(bool status, string userId, long eventId) 
        {
            var authenticatedUserId = GetAuthenticatedUserId();
            await EnsureEventOwnershipAsync(authenticatedUserId, eventId);

            Log.Information("Toggling queue activity. Status: {Status}, UserId: {UserId}, EventId: {EventId}", 
                status, authenticatedUserId, eventId);
            try
            {
                await notifier.ToggleQueueActivity(status, authenticatedUserId, eventId);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error toggling queue activity. Status: {Status}, UserId: {UserId}, EventId: {EventId}", 
                    status, authenticatedUserId, eventId);
                throw;
            }
        }
    }
}
