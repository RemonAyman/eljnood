using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Controllers
{
    [ApiController]
    [Route("api/content")]
    public class ContentController : ControllerBase
    {
        private readonly DbContext _context;

        public ContentController(DbContext context)
        {
            _context = context;
        }

        // GET: api/content/bible
        [HttpGet("bible")]
        public async Task<IActionResult> GetBibleContent()
        {
            var content = await _context.BibleContents
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new
                {
                    id = x.Id,
                    shortId = x.ShortId,
                    title = x.Title,
                    type = x.Type,
                    fileUrl = x.FileUrl,
                    category = x.Category,
                    createdAt = x.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                count = content.Count,
                content
            });
        }


        // GET: api/content/curricula
        [HttpGet("curricula")]
        public async Task<IActionResult> GetCurricula()
        {
            var curricula = await _context.Curricula
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new
                {
                    id = x.Id,
                    shortId = x.ShortId,
                    title = x.Title,
                    type = x.Type,
                    fileUrl = x.FileUrl,
                    fileType = x.FileType,
                    uploadedBy = x.UploadedBy,
                    createdAt = x.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                count = curricula.Count,
                curricula
            });
        }
    }
}