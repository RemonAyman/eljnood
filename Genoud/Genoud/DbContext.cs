using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Genoud.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Genoud
{
    public class DbContext: IdentityDbContext<ApplicationUser>
    {
       public DbContext(DbContextOptions<DbContext> options) : base(options)
       {
       }
        // Tables  //
        public DbSet<Members> Members { get; set; }
        public DbSet<Sections> Sections { get; set; }
        public DbSet<Squad> Squads { get; set; }
        public DbSet<Attendance> Attendances { get; set; }
        public DbSet<Messages> Messages { get; set; }
        public DbSet<ChatRooms> ChatRooms { get; set; }
        public DbSet<Subscriptions> Subscriptions { get; set; }
        public DbSet<DiscountCodes> DiscountCodes { get; set; }
        public DbSet<Pricing> Pricings { get; set; }
        public DbSet<FollowUp> FollowUps { get; set; }
        public DbSet<Curricula> Curricula { get; set; }
        public DbSet<BibleContent> BibleContents { get; set; }
        public DbSet<Memories> Memories { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<AbsenceExcuse> AbsenceExcuses { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // =====================================================
            // Member
            // =====================================================

            builder.Entity<Members>()
                .HasIndex(x => x.Code)
                .IsUnique();

            builder.Entity<Members>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Members>()
                .HasOne(x => x.Section)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.SectionId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Members>()
                .HasOne(x => x.Squad)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.SquadId)
                .OnDelete(DeleteBehavior.SetNull);


            // =====================================================
            // Section
            // =====================================================

            builder.Entity<Sections>()
                .HasOne(x => x.Leader)
                .WithMany()
                .HasForeignKey(x => x.LeaderId)
                .OnDelete(DeleteBehavior.SetNull);


            // =====================================================
            // Squad
            // =====================================================

            builder.Entity<Squad>()
                .HasOne(x => x.Section)
                .WithMany(x => x.Squads)
                .HasForeignKey(x => x.SectionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Squad>()
                .HasOne(x => x.Leader)
                .WithMany()
                .HasForeignKey(x => x.LeaderId)
                .OnDelete(DeleteBehavior.SetNull);


            // =====================================================
            // Attendance
            // =====================================================

            builder.Entity<Attendance>()
                .HasOne(x => x.Member)
                .WithMany()
                .HasForeignKey(x => x.MemberId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Attendance>()
                .HasOne(x => x.Recorder)
                .WithMany()
                .HasForeignKey(x => x.RecordedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // Prevent duplicate attendance for same member/date
            builder.Entity<Attendance>()
                .HasIndex(x => new { x.MemberId, x.Date})
                .IsUnique();


            // =====================================================
            // ChatRoom
            // =====================================================

            builder.Entity<ChatRooms>()
                .HasOne(x => x.Section)
                .WithMany()
                .HasForeignKey(x => x.SectionId)
                .OnDelete(DeleteBehavior.SetNull);


            // =====================================================
            // Message
            // =====================================================

            builder.Entity<Messages>()
                .HasOne(x => x.Room)
                .WithMany()
                .HasForeignKey(x => x.RoomId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Messages>()
                .HasOne(x => x.Sender)
                .WithMany()
                .HasForeignKey(x => x.SenderId)
                .OnDelete(DeleteBehavior.Restrict);


            // =====================================================
            // Subscription
            // =====================================================

            builder.Entity<Subscriptions>()
                .HasOne(x => x.Member)
                .WithMany()
                .HasForeignKey(x => x.MemberId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Subscriptions>()
                .HasOne(x => x.DiscountCode)
                .WithMany(x => x.Subscriptions)
                .HasForeignKey(x => x.DiscountCodeId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Subscriptions>()
                .HasOne(x => x.Recorder)
                .WithMany()
                .HasForeignKey(x => x.RecordedBy)
                .OnDelete(DeleteBehavior.Restrict);


            // =====================================================
            // DiscountCode
            // =====================================================

            builder.Entity<DiscountCodes>()
                .HasIndex(x => x.Code)
                .IsUnique();

            builder.Entity<DiscountCodes>()
                .HasOne(x => x.Creator)
                .WithMany()
                .HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);


            // =====================================================
            // Pricing
            // =====================================================

            builder.Entity<Pricing>()
                .HasOne(x => x.Updater)
                .WithMany()
                .HasForeignKey(x => x.UpdatedBy)
                .OnDelete(DeleteBehavior.Restrict);


            // =====================================================
            // FollowUp
            // =====================================================

            builder.Entity<FollowUp>()
                .HasOne(x => x.Member)
                .WithMany()
                .HasForeignKey(x => x.MemberId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<FollowUp>()
                .HasOne(x => x.Leader)
                .WithMany()
                .HasForeignKey(x => x.LeaderId)
                .OnDelete(DeleteBehavior.Restrict);


            // =====================================================
            // Curriculum
            // =====================================================

            builder.Entity<Curricula>()
                .HasOne(x => x.Uploader)
                .WithMany()
                .HasForeignKey(x => x.UploadedBy)
                .OnDelete(DeleteBehavior.Restrict);


            // =====================================================
            // Memory
            // =====================================================

            builder.Entity<Memories>()
                .HasOne(x => x.Uploader)
                .WithMany()
                .HasForeignKey(x => x.UploadedBy)
                .OnDelete(DeleteBehavior.Restrict);


            // =====================================================
            // ActivityLog
            // =====================================================

            builder.Entity<ActivityLog>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);


            // =====================================================
            // AbsenceExcuse
            // =====================================================

            builder.Entity<AbsenceExcuse>()
                .HasOne(x => x.Member)
                .WithMany()
                .HasForeignKey(x => x.MemberId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<AbsenceExcuse>()
                .HasOne(x => x.Attendance)
                .WithMany()
                .HasForeignKey(x => x.AttendanceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<AbsenceExcuse>()
                .HasOne(x => x.Reviewer)
                .WithMany()
                .HasForeignKey(x => x.ReviewedBy)
                .OnDelete(DeleteBehavior.SetNull);
        }

    }
}
