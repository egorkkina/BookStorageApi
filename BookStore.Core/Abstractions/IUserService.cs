using BookStore.Core.Models;

namespace BookStore.Core.Abstractions;

public interface IUserService
{
    Task<List<User>> GetUsers();
    Task<User?> GetUserById(Guid id);
    Task<User?> GetUserByEmail(string email);
    Task<Guid> CreateUser(User user);
    Task<Guid> UpdateUser(Guid id, string username, string email, UserRole role);
    Task<Guid> DeleteUser(Guid id);
    Task<bool> ValidateUserCredentials(string email, string password);
    Task<bool> IsUserAdminAsync(Guid id);
}