using BookStore.Core.Models;

namespace BookStore.Core.Abstractions;

public interface IJwtService
{
    string GenerateToken(User user);
}