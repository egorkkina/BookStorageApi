using BookStore.Core.Abstractions;
using BookStore.Core.Models;

namespace BookStorage.Application;

public class UserService(IUserRepository userRepository) : IUserService
{
    public async Task<List<User>> GetUsers()
    {
        return await userRepository.GetUsers();
    }

    public async Task<User?> GetUserById(Guid id)
    {
        var users = await userRepository.GetUsers();
        return users.FirstOrDefault(x => x.Id == id);
    }
    
    public async Task<User?> GetUserByEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be null or empty", nameof(email));

        var users = await userRepository.GetUsers();
        return users.FirstOrDefault(u => u.Email.Equals(email.Trim().ToLower(), StringComparison.OrdinalIgnoreCase));
    }

    public async Task<Guid> CreateUser(User user)
    {
        if (string.IsNullOrWhiteSpace(user.Username) || user.Username.Length > User.MAX_USERNAME_LENGTH)
            throw new ArgumentException($"Username must be between 1 and {User.MAX_USERNAME_LENGTH} characters");
    
        if (string.IsNullOrWhiteSpace(user.Email) || !user.Email.Contains('@'))
            throw new ArgumentException("Valid email is required");

        if (string.IsNullOrWhiteSpace(user.Password) || user.Password.Length < 8)
            throw new ArgumentException("Password must be at least 8 characters");
    
        
        var existingUser = await GetUserByEmail(user.Email);
        if (existingUser != null)
            throw new InvalidOperationException("User with this email already exists");

        return await userRepository.CreateUser(user);
    }

    public async Task<Guid> UpdateUser(Guid id, string username, string email, UserRole role)
    {
        var existingUser = await GetUserById(id);
        if (existingUser == null)
            throw new KeyNotFoundException($"User with ID {id} not found");

        if (string.IsNullOrWhiteSpace(username) || username.Length > User.MAX_USERNAME_LENGTH)
            throw new ArgumentException($"Username must be between 1 and {User.MAX_USERNAME_LENGTH} characters");

        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            throw new ArgumentException("Valid email is required");

        var userWithSameEmail = await GetUserByEmail(email);
        if (userWithSameEmail != null && userWithSameEmail.Id != id)
            throw new InvalidOperationException("Email is already taken by another user");

        return await userRepository.UpdateUser(id, username, email, role);
    }

    public async Task<Guid> DeleteUser(Guid id)
    {
        var existingUser = await GetUserById(id);
        if (existingUser == null)
            throw new KeyNotFoundException($"User with ID {id} not found");
        return await userRepository.DeleteUser(id);
    }

    public async Task<bool> ValidateUserCredentials(string email, string password)
    {
        var users = await userRepository.GetUsers();
        var user = users.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        
        return user != null && user.VerifyPassword(password);
    }
    
    public async Task<bool> IsUserAdminAsync(Guid id)
    {
        var user = await GetUserById(id);
        return user?.IsAdmin() ?? false;
    }
}