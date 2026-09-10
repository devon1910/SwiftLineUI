using Domain.DTOs.Responses;
using Domain.Interfaces;
using Domain.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.BackgroundServices
{
    public class EmailDeliveryJob(IServiceProvider serviceProvider, ILogger<EmailDeliveryJob> logger) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = serviceProvider.CreateScope();
                    var emailRepo = scope.ServiceProvider.GetRequiredService<IEmailsDeliveryRepo>();
                    List<EmailsDelivery>? dueEmails = await emailRepo.GetAllUnsentEmails();

                    foreach (var emailRecord in dueEmails ?? [])
                    {
                        bool sendSucceeded = false;
                        bool retryCountUpdateAttempted = false;

                        try
                        {
                            var result = await emailRepo.SendEmail(emailRecord);

                            if (result.Item1)
                            {
                                sendSucceeded = true;
                                await emailRepo.MarkEmailAsSent(emailRecord.Id);
                            }
                            else
                            {
                                retryCountUpdateAttempted = true;
                                await emailRepo.UpdateRetryCount(emailRecord.Id, result.Item2);
                            }
                        }
                        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                        {
                            return;
                        }
                        catch (Exception ex)
                        {
                            logger.LogError(ex, "An error occurred while delivering email {EmailDeliveryId}.", emailRecord.Id);

                            if (!sendSucceeded && !retryCountUpdateAttempted)
                            {
                                retryCountUpdateAttempted = true;
                                try
                                {
                                    await emailRepo.UpdateRetryCount(emailRecord.Id, ex.Message);
                                }
                                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                                {
                                    return;
                                }
                                catch (Exception retryEx)
                                {
                                    logger.LogError(retryEx, "An error occurred while updating the retry count for email {EmailDeliveryId}.", emailRecord.Id);
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
                    logger.LogError(ex, "An error occurred during an EmailDeliveryJob iteration.");
                }

                try
                {
                    await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    return;
                }
            }
        }
    }
}
