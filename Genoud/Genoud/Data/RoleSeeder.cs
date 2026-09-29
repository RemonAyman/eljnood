using Genoud.Constants;
using Microsoft.AspNetCore.Identity;
using System.Threading.Tasks;

namespace Genoud.Data
{
    public static class RoleSeeder
    {
        public static async Task SeedRolesAsync(
            RoleManager<IdentityRole> roleManager)
        {
            string[] roles =
            {
                Roles.Admin,
                Roles.Leader,
                Roles.SectorHead,
                Roles.Guardian
            };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(
                        new IdentityRole(role)
                    );
                }
            }
        }
    }
}