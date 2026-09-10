using Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.BackgroundServices
{
    public class AccountsCleanup(IServiceProvider serviceProvider, ILogger<AccountsCleanup> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = serviceProvider.CreateScope();
                    var authRepo = scope.ServiceProvider.GetRequiredService<IAuthRepo>();
                    var expiredAccounts = await authRepo.GetExpiredAccounts();

                    foreach (var account in expiredAccounts)
                    {
                        try
                        {
                            await authRepo.DeleteExpiredAccount(account);
                        }
                        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                        {
                            return;
                        }
                        catch (Exception ex)
                        {
                            logger.LogError(ex, "An error occurred while deleting expired account {AccountId}.", account.Id);
                        }
                    }
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    return;
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred during an AccountsCleanup iteration.");
                }

                try
                {
                    await Task.Delay(TimeSpan.FromHours(12), stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    return;
                }
            }
        }
    }
}
