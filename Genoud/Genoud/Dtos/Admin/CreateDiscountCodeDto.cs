using System;
using System.ComponentModel.DataAnnotations;

namespace Genoud.DTOs.Admin
{
    public class CreateDiscountCodeDto
    {
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Range(1, 100)]
        public int Percentage { get; set; }

        public bool IsActive { get; set; } = true;

        [Range(1, int.MaxValue)]
        public int MaxUses { get; set; }

        public DateTime? ExpiresAt { get; set; }
    }
}