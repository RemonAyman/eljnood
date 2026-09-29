using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Models
{
    public class DiscountCodes
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public string ShortId => Id.ToString("N")[..8].ToUpper();

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Range(10, 90)]
        public decimal Percentage { get; set; }

        public bool IsActive { get; set; } = true;

        public int MaxUses { get; set; }

        public int UsedCount { get; set; }

        [Required]
        public string CreatedBy { get; set; } = string.Empty;

        public DateTime? ExpiresAt { get; set; }

        // Navigation
        public ApplicationUser? Creator { get; set; }

        public ICollection<Subscriptions> Subscriptions { get; set; }
        = new List<Subscriptions>();
    }
}

