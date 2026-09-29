using Genoud.Models;
using Genoud.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Genoud.Data;

namespace Genoud
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime.
        // Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // =========================
            // PostgreSQL Database
            // =========================
            services.AddDbContext<DbContext>(options =>
                options.UseNpgsql(
                    Configuration.GetConnectionString("DefaultConnection")
                )
            );

            // =========================
            // ASP.NET Identity
            // =========================
            services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<DbContext>()
                .AddDefaultTokenProviders();

            // =========================
            // JWT Authentication
            // =========================
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme =
                    JwtBearerDefaults.AuthenticationScheme;

                options.DefaultChallengeScheme =
                    JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters =
                    new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,

                        ValidIssuer =
                            Configuration["Jwt:Issuer"],

                        ValidAudience =
                            Configuration["Jwt:Audience"],

                        IssuerSigningKey =
                            new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(
                                    Configuration["Jwt:Key"]
                                )
                            )
                    };
            });

            // =========================
            // Token Service
            // =========================
            services.AddScoped<ITokenService, TokenService>();

            // =========================
            // Controllers
            // =========================
            services.AddControllers();

            // =========================
            // Swagger
            // =========================
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Genoud API",
                    Version = "v1"
                });

                // JWT Bearer Authentication
                c.AddSecurityDefinition(
                    "Bearer",
                    new OpenApiSecurityScheme
                    {
                        Name = "Authorization",
                        Type = SecuritySchemeType.Http,
                        Scheme = "bearer",
                        BearerFormat = "JWT",
                        In = ParameterLocation.Header,
                        Description =
                            "Enter JWT token like: Bearer {your token}"
                    }
                );

                c.AddSecurityRequirement(
                    new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference =
                                    new OpenApiReference
                                    {
                                        Type =
                                            ReferenceType.SecurityScheme,
                                        Id = "Bearer"
                                    }
                            },
                            new string[] { }
                        }
                    }
                );
            });
        }

        // This method gets called by the runtime.
        // Use this method to configure the HTTP request pipeline.
        public void Configure(
            IApplicationBuilder app,
            IWebHostEnvironment env)
        {
            // =========================
            // Development
            // =========================
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            // =========================
            // Swagger
            // =========================
            app.UseSwagger();

            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint(
                    "/swagger/v1/swagger.json",
                    "Genoud V1"
                );
            });

            // =========================
            // Seed Roles
            // =========================
            using (var scope =
            app.ApplicationServices.CreateScope())
            {
                var roleManager =
                    scope.ServiceProvider
                        .GetRequiredService<RoleManager<IdentityRole>>();

                var userManager =
                    scope.ServiceProvider
                        .GetRequiredService<UserManager<ApplicationUser>>();

                // إنشاء الـ Roles
                RoleSeeder.SeedRolesAsync(roleManager)
                    .GetAwaiter()
                    .GetResult();

                // إنشاء حساب الـ Admin
                AdminSeeder.SeedAdminAsync(userManager)
                    .GetAwaiter()
                    .GetResult();
            }

            // =========================
            // HTTPS
            // =========================
            app.UseHttpsRedirection();

            // =========================
            // Routing
            // =========================
            app.UseRouting();

            // =========================
            // Authentication
            // =========================
            app.UseAuthentication();

            // =========================
            // Authorization
            // =========================
            app.UseAuthorization();

            // =========================
            // Controllers
            // =========================
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
