using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Models
{
    public class AbsenceExcuse
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public string ShortId => Id.ToString("N")[..8].ToUpper();

        [Required]
        public Guid MemberId { get; set; } = Guid.Empty;

        [Required]
        public Guid AttendanceId { get; set; } = Guid.Empty;

        [Required]
        [MaxLength(1000)]
        public string Reason { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = "PENDING";

        public string? ReviewedBy { get; set; }

        public DateTime? ReviewedAt { get; set; }

        // Navigation
        public Members Member { get; set; } = null!;

        public Attendance Attendance { get; set; } = null!;
        public ApplicationUser? Reviewer { get; set; }


    }
}
