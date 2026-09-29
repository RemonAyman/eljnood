using Genoud.Constants;
using Genoud.DTOs.Admin;
using Genoud.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Genoud.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = Roles.Admin)]
    public class AdminController : ControllerBase
    {
        private readonly DbContext _context;

        public AdminController(DbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET: api/admin/activity-log
        // جلب Activity Logs
        // =====================================================
        [HttpGet("activity-log")]
        public async Task<IActionResult> GetActivityLog()
        {
            var logs = await _context.ActivityLogs
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new
                {
                    id = x.Id,
                    shortId = x.ShortId,
                    userId = x.UserId,
                    action = x.Action,
                    details = x.Details,
                    ipAddress = x.IpAddress,
                    createdAt = x.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                count = logs.Count,
                logs
            });
        }


        // =====================================================
        // PUT: api/admin/pricing
        // تعديل الأسعار
        // =====================================================
        [HttpPut("pricing")]
        public async Task<IActionResult> UpdatePricing(
            UpdatePricingDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var pricing = await _context.Pricings
                .FirstOrDefaultAsync(x =>
                    x.ItemName == model.ItemName);

            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new
                {
                    message = "User is not authenticated."
                });
            }

            // لو المنتج مش موجود → إنشاء سعر جديد
            if (pricing == null)
            {
                pricing = new Pricing
                {
                    Id = Guid.NewGuid(),
                    ItemName = model.ItemName,
                    Price = model.Price,
                    IsActive = model.IsActive,
                    UpdatedBy = userId
                };

                _context.Pricings.Add(pricing);
            }
            else
            {
                // تعديل السعر الموجود
                pricing.Price = model.Price;
                pricing.IsActive = model.IsActive;
                pricing.UpdatedBy = userId;
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Pricing updated successfully.",

                pricing = new
                {
                    id = pricing.Id,
                    shortId = pricing.ShortId,
                    itemName = pricing.ItemName,
                    price = pricing.Price,
                    isActive = pricing.IsActive,
                    updatedBy = pricing.UpdatedBy
                }
            });
        }


        // =====================================================
        // POST: api/admin/discount-codes
        // إنشاء Discount Code
        // =====================================================
        [HttpPost("discount-codes")]
        public async Task<IActionResult> CreateDiscountCode(
            CreateDiscountCodeDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var code = model.Code.Trim().ToUpper();

            // التأكد إن الكود مش موجود
            var exists = await _context.DiscountCodes
                .AnyAsync(x => x.Code == code);

            if (exists)
            {
                return BadRequest(new
                {
                    message = "Discount code already exists."
                });
            }

            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new
                {
                    message = "User is not authenticated."
                });
            }

            var discountCode = new DiscountCodes
            {
                Id = Guid.NewGuid(),

                Code = code,

                Percentage = model.Percentage,

                IsActive = model.IsActive,

                MaxUses = model.MaxUses,

                UsedCount = 0,

                CreatedBy = userId,

                ExpiresAt = model.ExpiresAt
            };

            _context.DiscountCodes.Add(discountCode);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Discount code created successfully.",

                discountCode = new
                {
                    id = discountCode.Id,
                    shortId = discountCode.ShortId,

                    code = discountCode.Code,
                    percentage = discountCode.Percentage,

                    isActive = discountCode.IsActive,

                    maxUses = discountCode.MaxUses,
                    usedCount = discountCode.UsedCount,

                    createdBy = discountCode.CreatedBy,
                    expiresAt = discountCode.ExpiresAt
                }
            });
        }
    }
}