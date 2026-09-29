using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Dtos.ChatRoom
{
    public class SendMessageDto
    {
        public string Content { get; set; } = string.Empty;

        public string? MediaUrl { get; set; }

        public string MessageType { get; set; } = "TEXT";
    }
}
