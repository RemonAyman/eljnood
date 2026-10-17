using Genoud.Dtos.Subscriptions;
using Genoud.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace Genoud.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubscriptionsController : ControllerBase
    {
        private readonly DbContext _context;
        public SubscriptionsController(DbContext context)
        {
            _context = context;
        }
        //GET Subscriptions
        [HttpGet]
        public async Task<IActionResult> GetSubscriptions()
        {
            var subscriptions = await _context.Subscriptions
                .AsNoTracking()
                .ToListAsync();

            return Ok(new
            {
                count = subscriptions.Count,
                subscriptions
            });
        }

        //Create Subscription
        [HttpPost]
        public async Task<IActionResult> CreateSubscription(CreateSubscriptionDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var subscription = new Subscriptions
            {
                Id = Guid.NewGuid(),
                MemberId = model.MemberId,
                Type = model.Type,
                FestivalSub = model.FestivalSub,
                AnnualSub = model.AnnualSub,
                Vest = model.Vest,
                Scarf = model.Scarf,
                Badges = model.Badges,
                Subtotal = model.Subtotal,
                DiscountAmount = 0,
                Total = model.Subtotal,
                RecordedBy = User.FindFirstValue(ClaimTypes.NameIdentifier),
                CreatedAt = DateTime.UtcNow
            };

            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            return Ok(subscription);
        }

        // Apply Discount
        [HttpPost("apply-code")]
        public async Task<IActionResult> ApplyDiscountCode(ApplyDiscountCodeDto model)
        {
            var discountCode = await _context.DiscountCodes
                .FirstOrDefaultAsync(x =>
                    x.Code == model.Code &&
                    x.IsActive);

            if (discountCode == null)
            {
                return NotFound(new
                {
                    message = "Invalid or inactive discount code."
                });
            }

            if (discountCode.ExpiresAt.HasValue &&
                discountCode.ExpiresAt.Value < DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    message = "Discount code has expired."
                });
            }

            if (discountCode.UsedCount >= discountCode.MaxUses)
            {
                return BadRequest(new
                {
                    message = "Discount code usage limit reached."
                });
            }

            return Ok(new
            {
                code = discountCode.Code,
                percentage = discountCode.Percentage
            });
        }

        // Make Receipt
        [HttpGet("{id}/receipt")]
        public async Task<IActionResult> GetReceipt(Guid id)
        {
            var subscription = await _context.Subscriptions
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (subscription == null)
            {
                return NotFound(new
                {
                    message = "Subscription not found."
                });
            }

            return Ok(new
            {
                subscription.Id,
                subscription.MemberId,
                subscription.Type,
                subscription.Subtotal,
                subscription.DiscountAmount,
                subscription.Total,
                subscription.ReceiptNumber,
                subscription.ReceiptUrl,
                subscription.CreatedAt
            });
        }
    }
}
