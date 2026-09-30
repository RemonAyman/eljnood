using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Dtos.FollowUp
{
    public class CreateFollowUpDto
    {
        public Guid MemberId { get; set; }

        public string Type { get; set; } = string.Empty;

        public string? OccasionType { get; set; }

        public string? Notes { get; set; }

        public DateTime FollowUpDate { get; set; }
    }
}
