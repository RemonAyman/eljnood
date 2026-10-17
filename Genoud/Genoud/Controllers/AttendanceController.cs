using Genoud.DTOs.Attendance;
using Genoud.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace Genoud.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly DbContext _context;

        public AttendanceController(DbContext context)
        {
            _context = context;
        }

        // =========================================================
        // POST: api/Attendance/qr-scan
        // تسجيل الحضور عن طريق QR
        // =========================================================
        [HttpPost("qr-scan")]
        public async Task<IActionResult> QrScan(QrScanDto model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Code))
            {
                return BadRequest(new
                {
                    message = "Member code is required."
                });
            }

            // البحث عن العضو عن طريق Code
            var member = await _context.Members
                .FirstOrDefaultAsync(x => x.Code == model.Code);

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Member not found."
                });
            }

            // التحقق هل تم تسجيل حضور اليوم بالفعل
            var today = DateTime.UtcNow.Date;

            var existingAttendance = await _context.Attendances
                .FirstOrDefaultAsync(x =>
                    x.MemberId == member.Id &&
                    x.Date.Date == today);

            if (existingAttendance != null)
            {
                return BadRequest(new
                {
                    message = "Attendance already recorded for today.",
                    attendanceId = existingAttendance.Id,
                    status = existingAttendance.Status
                });
            }

            // المستخدم الذي قام بتسجيل الحضور
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new
                {
                    message = "User is not authenticated."
                });
            }

            // إنشاء سجل الحضور
            var attendance = new Attendance
            {
                Id = Guid.NewGuid(),
                MemberId = member.Id,
                Date = DateTime.UtcNow,
                Status = "PRESENT",
                RecordedBy = userId,
                Method = "QR"
            };

            _context.Attendances.Add(attendance);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Attendance recorded successfully.",

                attendance = new
                {
                    attendanceId = attendance.Id,
                    shortId = attendance.ShortId,

                    memberId = member.Id,
                    memberShortId = member.ShortId,

                    memberCode = member.Code,
                    memberName = member.Name,

                    date = attendance.Date,
                    status = attendance.Status,
                    method = attendance.Method
                }
            });
        }


        // =========================================================
        // GET: api/Attendance/{memberId}
        // جلب سجل حضور عضو معين
        // =========================================================
        [HttpGet("{memberId}")]
        public async Task<IActionResult> GetMemberAttendance(Guid memberId)
        {
            var member = await _context.Members
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == memberId);

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Member not found."
                });
            }

            var attendance = await _context.Attendances
                .AsNoTracking()
                .Where(x => x.MemberId == memberId)
                .OrderByDescending(x => x.Date)
                .Select(x => new
                {
                    attendanceId = x.Id,
                    shortId = x.ShortId,
                    date = x.Date,
                    status = x.Status,
                    method = x.Method,
                    notes = x.Notes
                })
                .ToListAsync();

            return Ok(new
            {
                member = new
                {
                    id = member.Id,
                    shortId = member.ShortId,
                    code = member.Code,
                    name = member.Name
                },

                count = attendance.Count,
                attendance
            });
        }


        // =========================================================
        // POST: api/Attendance/excuse
        // تقديم عذر للغياب
        // =========================================================
        [HttpPost("excuse")]
        public async Task<IActionResult> CreateExcuse(
            CreateAbsenceExcuseDto model)
        {
            if (model == null)
            {
                return BadRequest(new
                {
                    message = "Request data is required."
                });
            }

            if (string.IsNullOrWhiteSpace(model.Reason))
            {
                return BadRequest(new
                {
                    message = "Reason is required."
                });
            }

            // البحث عن سجل الحضور
            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(x => x.Id == model.AttendanceId);

            if (attendance == null)
            {
                return NotFound(new
                {
                    message = "Attendance record not found."
                });
            }

            // العذر مسموح فقط للغياب
            if (attendance.Status != "ABSENT")
            {
                return BadRequest(new
                {
                    message = "An excuse can only be submitted for an absence."
                });
            }

            // التأكد أن مفيش عذر موجود بالفعل
            var existingExcuse = await _context.AbsenceExcuses
                .FirstOrDefaultAsync(x =>
                    x.AttendanceId == model.AttendanceId);

            if (existingExcuse != null)
            {
                return BadRequest(new
                {
                    message = "An excuse already exists for this attendance."
                });
            }

            // إنشاء العذر
            var excuse = new AbsenceExcuse
            {
                Id = Guid.NewGuid(),
                MemberId = attendance.MemberId,
                AttendanceId = attendance.Id,
                Reason = model.Reason,
                Status = "PENDING"
            };

            _context.AbsenceExcuses.Add(excuse);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Absence excuse submitted successfully.",

                excuse = new
                {
                    excuseId = excuse.Id,
                    shortId = excuse.ShortId,

                    memberId = excuse.MemberId,
                    attendanceId = excuse.AttendanceId,

                    reason = excuse.Reason,
                    status = excuse.Status,

                    reviewedBy = excuse.ReviewedBy,
                    reviewedAt = excuse.ReviewedAt
                }
            });
        }


        // =========================================================
        // PUT: api/Attendance/excuse/{id}
        // قبول أو رفض العذر
        // =========================================================
        [HttpPut("excuse/{id}")]
        public async Task<IActionResult> ReviewExcuse(
            Guid id,
            ReviewAbsenceExcuseDto model)
        {
            if (model == null ||
                string.IsNullOrWhiteSpace(model.Status))
            {
                return BadRequest(new
                {
                    message = "Status is required."
                });
            }

            var status = model.Status.Trim().ToUpper();

            // السماح فقط بـ APPROVED أو REJECTED
            if (status != "APPROVED" &&
                status != "REJECTED")
            {
                return BadRequest(new
                {
                    message = "Status must be APPROVED or REJECTED."
                });
            }

            // البحث عن العذر
            var excuse = await _context.AbsenceExcuses
                .FirstOrDefaultAsync(x => x.Id == id);

            if (excuse == null)
            {
                return NotFound(new
                {
                    message = "Absence excuse not found."
                });
            }

            // منع مراجعة العذر أكثر من مرة
            if (excuse.Status != "PENDING")
            {
                return BadRequest(new
                {
                    message = "This excuse has already been reviewed."
                });
            }

            // المستخدم الذي قام بالمراجعة
            var reviewerId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(reviewerId))
            {
                return Unauthorized(new
                {
                    message = "User is not authenticated."
                });
            }

            // تحديث حالة العذر
            excuse.Status = status;
            excuse.ReviewedBy = reviewerId;
            excuse.ReviewedAt = DateTime.UtcNow;

            // لو العذر اتقبل
            // نحول حالة الحضور من ABSENT إلى EXCUSED
            if (status == "APPROVED")
            {
                var attendance = await _context.Attendances
                    .FirstOrDefaultAsync(x =>
                        x.Id == excuse.AttendanceId);

                if (attendance != null)
                {
                    attendance.Status = "EXCUSED";
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Absence excuse reviewed successfully.",

                excuse = new
                {
                    excuseId = excuse.Id,
                    shortId = excuse.ShortId,

                    memberId = excuse.MemberId,
                    attendanceId = excuse.AttendanceId,

                    reason = excuse.Reason,
                    status = excuse.Status,

                    reviewedBy = excuse.ReviewedBy,
                    reviewedAt = excuse.ReviewedAt
                }
            });
        }
    }
}