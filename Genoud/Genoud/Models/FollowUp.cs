using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Models
{
    public class FollowUp
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public string ShortId => Id.ToString("N")[..8].ToUpper();

        [Required]
        public Guid MemberId { get; set; } = Guid.Empty;

        [Required]
        public string LeaderId { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; }

        [MaxLength(100)]
        public string? OccasionType { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        [Required]
        public DateTime FollowUpDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Members Member { get; set; } = null!;

        public ApplicationUser? Leader { get; set; }
    }

}
