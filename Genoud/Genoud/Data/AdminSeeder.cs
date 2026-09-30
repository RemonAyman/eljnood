using Genoud.Constants;
using Genoud.Models;
using Microsoft.AspNetCore.Identity;
using System;
using System.Linq;
using System.Threading.Tasks;
namespace Genoud.Data
{
    public static class AdminSeeder
    {
        public static async Task SeedAdminAsync(
            UserManager<ApplicationUser> userManager)
        {
            string email = "admin@genoud.com";
            string password = "Admin@963852";

            var existingAdmin = await userManager.FindByEmailAsync(email);

            if (existingAdmin != null)
            {
                // نتأكد إن الحساب Admin
                if (!await userManager.IsInRoleAsync(existingAdmin, Roles.Admin))
                {
                    await userManager.AddToRoleAsync(
                        existingAdmin,
                        Roles.Admin
                    );
                }

                return;
            }

            var admin = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(
                admin,
                password
            );

            if (!result.Succeeded)
            {
                throw new System.Exception(
                    string.Join(
                        ", ",
                        result.Errors
                            .Select(e => e.Description)
                    )
                );
            }

            await userManager.AddToRoleAsync(
                admin,
                Roles.Admin
            );
        }
    }
}
