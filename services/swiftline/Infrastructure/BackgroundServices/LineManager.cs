
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Domain.Interfaces;
using Domain.Models;

namespace Infrastructure.BackgroundServices
{
    public class LineManager(IServiceProvider serviceProvider, ILogger<LineManager> logger) : BackgroundService
    {

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = serviceProvider.CreateScope();
                    var linesRepo = scope.ServiceProvider.GetRequiredService<ILineRepo>();
                    var eventsRepo = scope.ServiceProvider.GetRequiredService<IEventRepo>();
                    var signalRNotifier = scope.ServiceProvider.GetRequiredService<ISignalRNotifierRepo>();

                    var cachedEvents = await eventsRepo.GetActiveEvents();

                    foreach (var e in cachedEvents)
                    {
                        List<Line?> firstLinesMembers = await linesRepo.GetFirstLineMembers(e.Id, e.StaffCount);

                        foreach (var line in firstLinesMembers)
                        {
                            if (line is not null && await linesRepo.IsItUserTurnToBeServed(line, e.AverageTimeToServeSeconds))
                            {
                                if (await linesRepo.MarkUserAsServed(line, "served", ""))
                                {
                                    await signalRNotifier.BroadcastLineUpdate(line, -1);
                                    await linesRepo.Notify2ndLineMember(line);
                                }
                            }
                        }
                    }
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    return;
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred during a LineManager iteration.");
                }

                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    return;
                }
            }
        }
    }
}
