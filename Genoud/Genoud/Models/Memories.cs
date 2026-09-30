using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Models
{
    public class Memories
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public string ShortId => Id.ToString("N")[..8].ToUpper();

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string MediaUrl { get; set; } = string.Empty;

        [Required]
        public string MediaType { get; set; }

        [Required]
        public string UploadedBy { get; set; } = string.Empty;

        public bool IsVisible { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ApplicationUser? Uploader { get; set; }
    }
}
