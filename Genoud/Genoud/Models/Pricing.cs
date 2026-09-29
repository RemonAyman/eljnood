using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Models
{
    public class Pricing
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public string ShortId => Id.ToString("N")[..8].ToUpper();

        [Required]
        [MaxLength(100)]
        public string ItemName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        public bool IsActive { get; set; } = true;

        [Required]
        public string UpdatedBy { get; set; } = string.Empty;

        public ApplicationUser? Updater { get; set; }
    }
}
