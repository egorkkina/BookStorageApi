using BookStore.Core.Models;

namespace BookStore.Core.Abstractions;

public interface IUserRepository
{
    Task<List<User>> GetUsers();
    Task<Guid> CreateUser(User user);
    Task<Guid> UpdateUser(Guid id, string username, string email, UserRole role);
    Task<Guid> DeleteUser(Guid id);
}