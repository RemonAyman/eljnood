using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Models
{
    public class Members
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public string ShortId => Id.ToString("N")[..8].ToUpper();

        public string? UserId { get; set; }

        // كود الطفل الفريد
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

      
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

       
        [Required]
        public Gender Gender { get; set; }

       
        public DateTime? BirthDate { get; set; }

        [MaxLength(100)]
        public string? SchoolGrade { get; set; }

        public Guid? SectionId { get; set; }

        public Guid? SquadId { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [Required]
        [MaxLength(20)]
        public string GuardianPhone { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Address { get; set; }

        [MaxLength(20)]
        public string? BuildingNo { get; set; }

        [MaxLength(150)]
        public string? Street { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(UserId))]
        public ApplicationUser? User { get; set; }

        public Sections? Section { get; set; }

        public Squad? Squad { get; set; }
    }

    public enum Gender {
        Male,
        Female
    }
}

