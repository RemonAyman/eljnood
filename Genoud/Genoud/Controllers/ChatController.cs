using Genoud.Dtos.ChatRoom;
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
    [Route("api/chat")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly DbContext _context;

        public ChatController(DbContext context)
        {
            _context = context;
        }

        // GET: /api/chat/rooms
        [HttpGet("rooms")]
        public async Task<IActionResult> GetRooms()
        {
            var rooms = await _context.ChatRooms
                .AsNoTracking()
                .OrderByDescending(x => x.Id)
                .Select(x => new
                {
                    id = x.Id,
                    shortId = x.ShortId,
                    name = x.Name,
                    type = x.Type,
                    sectionId = x.SectionId
                })
                .ToListAsync();

            return Ok(new
            {
                count = rooms.Count,
                rooms
            });
        }

        // GET: /api/chat/rooms/{id}/messages
        [HttpGet("rooms/{id}/messages")]
        public async Task<IActionResult> GetMessages(Guid id)
        {
            var room = await _context.ChatRooms
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);

            if (room == null)
            {
                return NotFound(new
                {
                    message = "Chat room not found."
                });
            }

            var messages = await _context.Messages
                .AsNoTracking()
                .Where(x => x.RoomId == id)
                .OrderBy(x => x.CreatedAt)
                .Select(x => new
                {
                    id = x.Id,
                    shortId = x.ShortId,
                    senderId = x.SenderId,
                    content = x.Content,
                    mediaUrl = x.MediaUrl,
                    messageType = x.MessageType,
                    createdAt = x.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                room = new
                {
                    id = room.Id,
                    shortId = room.ShortId,
                    name = room.Name,
                    type = room.Type
                },
                count = messages.Count,
                messages
            });
        }

        // POST: /api/chat/rooms/{id}/messages
        [HttpPost("rooms/{id}/messages")]
        public async Task<IActionResult> SendMessage(
            Guid id,
            SendMessageDto model)
        {
            if (model == null)
            {
                return BadRequest(new
                {
                    message = "Message data is required."
                });
            }

            if (string.IsNullOrWhiteSpace(model.Content) &&
                string.IsNullOrWhiteSpace(model.MediaUrl))
            {
                return BadRequest(new
                {
                    message = "Message content or media is required."
                });
            }

            var room = await _context.ChatRooms
                .FirstOrDefaultAsync(x => x.Id == id);

            if (room == null)
            {
                return NotFound(new
                {
                    message = "Chat room not found."
                });
            }

            var senderId = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (string.IsNullOrEmpty(senderId))
            {
                return Unauthorized(new
                {
                    message = "User is not authenticated."
                });
            }

            var message = new Messages
            {
                Id = Guid.NewGuid(),
                RoomId = id,
                SenderId = senderId,
                Content = model.Content,
                MediaUrl = model.MediaUrl,
                MessageType = model.MessageType,
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Message sent successfully.",
                data = new
                {
                    id = message.Id,
                    shortId = message.ShortId,
                    roomId = message.RoomId,
                    senderId = message.SenderId,
                    content = message.Content,
                    mediaUrl = message.MediaUrl,
                    messageType = message.MessageType,
                    createdAt = message.CreatedAt
                }
            });
        }
    }
}