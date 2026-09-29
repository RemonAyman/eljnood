using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Models
{
    public class Subscriptions
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public string ShortId => Id.ToString("N")[..8].ToUpper();

        [Required]
        public Guid MemberId { get; set; } = Guid.Empty;

        [Required]
        public string Type { get; set; }

        public bool FestivalSub { get; set; }

        public bool AnnualSub { get; set; }

        public bool Vest { get; set; }

        public bool Scarf { get; set; }

        public bool Badges { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal Subtotal { get; set; }

        public Guid? DiscountCodeId { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal DiscountAmount { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal Total { get; set; }

        [MaxLength(100)]
        public string? ReceiptNumber { get; set; }

        public string? ReceiptUrl { get; set; }

        [Required]
        public string RecordedBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Members Member { get; set; } = null!;

        public DiscountCodes? DiscountCode { get; set; }

        public ApplicationUser? Recorder { get; set; }
    } 
}

