using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Genoud.Models
{
    public class Squad
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public string ShortId => Id.ToString("N")[..8].ToUpper();

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public Guid SectionId { get; set; } = Guid.Empty;

        [MaxLength(8)]
        public string? LeaderId { get; set; }

        [ForeignKey(nameof(SectionId))]
        public Sections Section { get; set; } = null!;

        [ForeignKey(nameof(LeaderId))]
        public ApplicationUser? Leader { get; set; }

        public ICollection<Members> Members { get; set; } = new List<Members>();
    }
}
