using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;


namespace Genoud.Models
{
    public class Sections
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public string ShortId => Id.ToString("N")[..8].ToUpper();
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string gender_type { get; set; }
        [MaxLength(8)]
        public string? LeaderId { get; set; }

        [ForeignKey(nameof(LeaderId))]
        public ApplicationUser? Leader { get; set; }

        public ICollection<Squad> Squads { get; set; } = new List<Squad>();

        public ICollection<Members> Members { get; set; } = new List<Members>();
    }
}
