using Genoud.Models;
using System;
using System.ComponentModel.DataAnnotations;

namespace Genoud.DTOs.Members
{
    public class UpdateMemberDto
    {
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
    }
}