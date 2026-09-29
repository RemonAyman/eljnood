using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Controllers
{
    [ApiController]
    [Route("api/memories")]
    public class MemoriesController : ControllerBase
    {
        private readonly DbContext _context;

        public MemoriesController(DbContext context)
        {
            _context = context;
        }

        // GET: api/memories
        [HttpGet]
        public async Task<IActionResult> GetMemories()
        {
            var memories = await _context.Memories
                .AsNoTracking()
                .Where(x => x.IsVisible)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new
                {
                    id = x.Id,
                    shortId = x.ShortId,
                    title = x.Title,
                    mediaUrl = x.MediaUrl,
                    mediaType = x.MediaType,
                    uploadedBy = x.UploadedBy,
                    isVisible = x.IsVisible,
                    createdAt = x.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                count = memories.Count,
                memories
            });
        }
    }
}