using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Genoud.DTOs.Admin
{
    public class UpdatePricingDto
    {
        [Required]
        [MaxLength(150)]
        public string ItemName { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public bool IsActive { get; set; }
    }
}