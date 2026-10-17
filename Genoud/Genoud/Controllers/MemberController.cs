using ClosedXML.Excel;
using Genoud.Constants;
using Genoud.DTOs.Members;
using Genoud.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MembersController : ControllerBase
    {
        private readonly DbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public MembersController(
            DbContext context,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpPost("import")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> ImportMembers(IFormFile file)
        {
            // Check file
            if (file == null || file.Length == 0)
            {
                return BadRequest(new
                {
                    message = "Please upload an Excel file."
                });
            }

            // Check extension
            var extension = Path.GetExtension(file.FileName);

            if (!string.Equals(
                extension,
                ".xlsx",
                StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    message = "Only .xlsx files are allowed."
                });
            }

            var results = new List<ImportedMemberResultDto>();

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);

                using (var workbook = new XLWorkbook(stream))
                {
                    var worksheet = workbook.Worksheets.First();

                    // Excel:
                    // Column 1 = Name
                    // Column 2 = Code

                    var rows = worksheet
                        .RowsUsed()
                        .Skip(1);

                    foreach (var row in rows)
                    {
                        // Read Name
                        var name = row
                            .Cell(2)
                            .GetString()
                            .Trim();

                        // Read Code
                        var code = row
                            .Cell(8)
                            .GetString()
                            .Trim();

                        // Skip empty rows
                        if (string.IsNullOrWhiteSpace(name) ||
                            string.IsNullOrWhiteSpace(code))
                        {
                            continue;
                        }

                        // Check duplicate Member Code
                        var codeExists = await _context.Members
                            .AnyAsync(x => x.Code == code);

                        if (codeExists)
                        {
                            continue;
                        }

                        // Get first name
                        var firstName = GetFirstName(name);

                        // Get full name without spaces
                        var emailName = GetEmailName(name);

                        // Generate unique email
                        var email = await GenerateUniqueEmail(
                            emailName);

                        // Generate password
                        var password = GeneratePassword(
                            firstName,
                            code);

                        // Create Identity User
                        var user = new ApplicationUser
                        {
                            UserName = email,
                            Email = email,

                            // Account created by Admin
                            EmailConfirmed = true
                        };

                        var userResult = await _userManager
                            .CreateAsync(
                                user,
                                password);

                        if (!userResult.Succeeded)
                        {
                            return BadRequest(new
                            {
                                message =
                                    $"Failed to create account for {name}.",

                                errors = userResult.Errors
                            });
                        }

                        // Create Member
                        var member = new Members
                        {
                            // GUID generated automatically
                            Id = Guid.NewGuid(),

                            // Link Member to Identity User
                            UserId = user.Id,

                            // Excel Code
                            Code = code,

                            // Excel Name
                            Name = name,

                            CreatedAt = DateTime.UtcNow
                        };

                        _context.Members.Add(member);

                        await _context.SaveChangesAsync();

                        // Add result
                        results.Add(
                            new ImportedMemberResultDto
                            {
                                Name = name,

                                Code = code,

                                Email = email,

                                // Returned to Admin
                                // NOT stored in DB
                                Password = password,

                                MemberId =
                                    member.Id.ToString()
                            });
                    }
                }
            }

            return Ok(new
            {
                message =
                    "Members imported successfully.",

                count = results.Count,

                members = results
            });
        }


        // Get first name
        // Example:
        // Abanoub Mamdouh Tadros
        //        ↓
        // Abanoub
        private string GetFirstName(string fullName)
        {
            var parts = fullName
                .Split(
                    ' ',
                    StringSplitOptions.RemoveEmptyEntries);

            return parts.FirstOrDefault()
                   ?? "User";
        }


        // Get full name without spaces
        // Example:
        // Abanoub Mamdouh Tadros
        //        ↓
        // AbanoubMamdouhTadros
        private string GetEmailName(string fullName)
        {
            return string.Join(
                "",
                fullName
                    .Split(
                        ' ',
                        StringSplitOptions.RemoveEmptyEntries)
            );
        }


        // Generate unique email
        private async Task<string> GenerateUniqueEmail(
            string emailName)
        {
            // First attempt
            var baseEmail =
                $"{emailName}@Scout.org";

            var existingUser =
                await _userManager
                    .FindByEmailAsync(baseEmail);

            if (existingUser == null)
            {
                return baseEmail;
            }

            // If email already exists
            // Example:
            // AhmedMohamedAli@Genoud.com
            // AhmedMohamedAli2@Genoud.com
            // AhmedMohamedAli3@Genoud.com

            var counter = 2;

            while (true)
            {
                var email =
                    $"{emailName}{counter}@Scout.org";

                var user =
                    await _userManager
                        .FindByEmailAsync(email);

                if (user == null)
                {
                    return email;
                }

                counter++;
            }
        }


        // Generate password
        // Example:
        // Abanoub + 12345
        //        ↓
        // Abanoub@12345
        private string GeneratePassword(
            string firstName,
            string code)
        {
            return $"{firstName}@{code}";
        }
        //-------------------------------------------------------------------------//
        // GetAllMembers
        //-------------------------------------------------------------------------//

        [HttpGet("All-Member")]
        public async Task<IActionResult> GetAllMember()
        {
            var members = await _context.Members
            .AsNoTracking()
        .Select(x => new
        {
            id = x.Id,
            shortId = x.ShortId,
            code = x.Code,
            name = x.Name,
            gender = x.Gender,
            birthDate = x.BirthDate,
            schoolGrade = x.SchoolGrade,
            sectionId = x.SectionId,
            squadId = x.SquadId,
            phone = x.Phone,
            guardianPhone = x.GuardianPhone,
            address = x.Address,
            buildingNo = x.BuildingNo,
            street = x.Street,
            createdAt = x.CreatedAt
        })
        .ToListAsync();
            return Ok(new
            {
                count = members.Count,
                members = members
            });
        }

        //-------------------------------------------------------------------------//
        // Get Email Password Members From Code
        //-------------------------------------------------------------------------//
        [HttpGet("credentials/{code}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> GetMemberCredentials(string code)
        {
            var member = await _context.Members
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Code == code);

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Member not found."
                });
            }

            if (string.IsNullOrEmpty(member.UserId))
            {
                return NotFound(new
                {
                    message = "This member does not have an account."
                });
            }

            var user = await _userManager.FindByIdAsync(member.UserId);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User account not found."
                });
            }

            var firstName = GetFirstName(member.Name);

            // Password was generated originally as:
            // FirstName@Code
            var password = $"{firstName}@{member.Code}";

            return Ok(new MemberCredentialsDto
            {
                Name = member.Name,
                Code = member.Code,
                Email = user.Email,
                Password = password
            });
        }

        //-------------------------------------------------------------------------//
        // Update Members From IdMember
        //-------------------------------------------------------------------------//

        [HttpPut("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> UpdateMember(Guid id, UpdateMemberDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var member = await _context.Members
                .FirstOrDefaultAsync(x => x.Id == id);

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Member not found."
                });
            }

            // Check if Code belongs to another member
            var codeExists = await _context.Members
                .AnyAsync(x =>
                    x.Code == model.Code &&
                    x.Id != id);

            if (codeExists)
            {
                return BadRequest(new
                {
                    message = "Member code already exists."
                });
            }

            // Update Member
            member.Code = model.Code;
            member.Name = model.Name;
            member.Gender = model.Gender;
            member.BirthDate = model.BirthDate;
            member.SchoolGrade = model.SchoolGrade;
            member.SectionId = model.SectionId;
            member.SquadId = model.SquadId;
            member.Phone = model.Phone;
            member.GuardianPhone = model.GuardianPhone;
            member.Address = model.Address;
            member.BuildingNo = model.BuildingNo;
            member.Street = model.Street;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Member updated successfully.",
                member = new
                {
                    id = member.Id,
                    shortId = member.ShortId,
                    code = member.Code,
                    name = member.Name,
                    gender = member.Gender,
                    birthDate = member.BirthDate,
                    schoolGrade = member.SchoolGrade,
                    sectionId = member.SectionId,
                    squadId = member.SquadId,
                    phone = member.Phone,
                    guardianPhone = member.GuardianPhone,
                    address = member.Address,
                    buildingNo = member.BuildingNo,
                    street = member.Street
                }
            });
        }

        //-------------------------------------------------------------------------//
        // Delete Members From IdMember
        //-------------------------------------------------------------------------//
        [HttpDelete("{id}")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> DeleteMember(Guid id)
        {
            var member = await _context.Members
                .FirstOrDefaultAsync(x => x.Id == id);

            if (member == null)
            {
                return NotFound(new
                {
                    message = "Member not found."
                });
            }

            // Delete Identity User
            if (!string.IsNullOrEmpty(member.UserId))
            {
                var user = await _userManager
                    .FindByIdAsync(member.UserId);

                if (user != null)
                {
                    var userResult = await _userManager
                        .DeleteAsync(user);

                    if (!userResult.Succeeded)
                    {
                        return BadRequest(new
                        {
                            message = "Failed to delete member account.",
                            errors = userResult.Errors
                        });
                    }
                }
            }

            // Delete Member
            _context.Members.Remove(member);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Member deleted successfully."
            });
        }
    }
}