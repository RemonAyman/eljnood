using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.DTOs.Attendance
{
    public class CreateAbsenceExcuseDto
    {
        public Guid AttendanceId { get; set; }

        public string Reason { get; set; } = string.Empty;
    }
}
