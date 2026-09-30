using Genoud.Dtos.FollowUp;
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
    [Route("api/followup")]
    [Authorize]
    public class FollowUpController : ControllerBase
    {
        private readonly DbContext _context;

        public FollowUpController(DbContext context)
        {
            _context = context;
        }

        // POST: /api/followup
        [HttpPost]
        public async Task<IActionResult> CreateFollowUp(
            CreateFollowUpDto model)
        {
            if (model == null)
            {
                return BadRequest(new
                {
                    message = "Follow-up data is required."
                });
            }

            if (model.MemberId == Guid.Empty)
            {
                return BadRequest(new
                {
                    message = "MemberId is required."
                });
            }

            if (string.IsNullOrWhiteSpace(model.Type))
            {
                return BadRequest(new
                {
                    message = "Follow-up type is required."
                });
            }

            var member = await _context.Members
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == model.MemberId);

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Member not found."
                });
            }

            var leaderId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (string.IsNullOrEmpty(leaderId))
            {
                return Unauthorized(new
                {
                    message = "User is not authenticated."
                });
            }

            var followUp = new FollowUp
            {
                Id = Guid.NewGuid(),
                MemberId = model.MemberId,
                LeaderId = leaderId,
                Type = model.Type,
                OccasionType = model.OccasionType,
                Notes = model.Notes,
                FollowUpDate = model.FollowUpDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.FollowUps.Add(followUp);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Follow-up created successfully.",
                followUp = new
                {
                    id = followUp.Id,
                    shortId = followUp.ShortId,
                    memberId = followUp.MemberId,
                    leaderId = followUp.LeaderId,
                    type = followUp.Type,
                    occasionType = followUp.OccasionType,
                    notes = followUp.Notes,
                    followUpDate = followUp.FollowUpDate,
                    createdAt = followUp.CreatedAt
                }
            });
        }

        // GET: /api/followup/member/{id}
        [HttpGet("member/{id}")]
        public async Task<IActionResult> GetMemberFollowUps(Guid id)
        {
            var member = await _context.Members
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Member not found."
                });
            }

            var followUps = await _context.FollowUps
                .AsNoTracking()
                .Where(x => x.MemberId == id)
                .OrderByDescending(x => x.FollowUpDate)
                .Select(x => new
                {
                    id = x.Id,
                    shortId = x.ShortId,
                    memberId = x.MemberId,
                    leaderId = x.LeaderId,
                    type = x.Type,
                    occasionType = x.OccasionType,
                    notes = x.Notes,
                    followUpDate = x.FollowUpDate,
                    createdAt = x.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                member = new
                {
                    id = member.Id,
                    shortId = member.ShortId,
                    code = member.Code,
                    name = member.Name
                },

                count = followUps.Count,

                followUps
            });
        }
    }
}