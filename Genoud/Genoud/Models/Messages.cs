using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Models
{
    public class Messages
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [NotMapped]
        public string ShortId => Id.ToString("N")[..8].ToUpper();

        [Required]
        public Guid RoomId { get; set; } = Guid.Empty;

        [Required]
        public string SenderId { get; set; } = string.Empty;

        [MaxLength(5000)]
        public string? Content { get; set; }

        public string? MediaUrl { get; set; }

        [Required]
        public string MessageType { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        [ForeignKey(nameof(RoomId))]
        public ChatRooms Room { get; set; } = null!;

        [ForeignKey(nameof(SenderId))]
        public ApplicationUser Sender { get; set; } = null!;
    }
}
