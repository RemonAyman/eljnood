using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Models
{
    public class BibleContent
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public string ShortId => Id.ToString("N")[..8].ToUpper();

            [Required]
            [MaxLength(200)]
            public string Title { get; set; } = string.Empty;

            [Required]
            public string Type { get; set; }

            [Required]
            public string FileUrl { get; set; } = string.Empty;

            [MaxLength(100)]
            public string? Category { get; set; }

            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
