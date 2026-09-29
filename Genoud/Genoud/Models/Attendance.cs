using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Genoud.Models
{
    public class Attendance
    {

        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public string ShortId => Id.ToString("N")[..8].ToUpper();

        [Required]
        public Guid MemberId { get; set; } = Guid.Empty;

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public string Status { get; set; }

        // الشخص الذي سجل الحضور
        [Required]
        public string RecordedBy { get; set; } = string.Empty;

        [Required]
        public string Method { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        // Navigation
        [ForeignKey(nameof(MemberId))]
        public Members Member { get; set; } = null!;

        [ForeignKey(nameof(RecordedBy))]
        public ApplicationUser? Recorder { get; set; }
    }
}

