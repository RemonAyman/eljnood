using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Genoud.Models;

namespace Genoud.Services
{
    public interface ITokenService
    {
        Task<string> CreateToken(ApplicationUser user);
    }
}