using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Genoud.Dtos.Subscriptions
{
    public class CreateSubscriptionDto
    {
        public Guid MemberId { get; set; }

        public string Type { get; set; }

        public bool FestivalSub { get; set; }
        public bool AnnualSub { get; set; }
        public bool Vest { get; set; }
        public bool Scarf { get; set; }
        public bool Badges { get; set; }

        public decimal Subtotal { get; set; }
    }
}
