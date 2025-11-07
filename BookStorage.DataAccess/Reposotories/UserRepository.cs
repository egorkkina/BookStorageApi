using BookStore.Core.Models;
using BookStorage.DataAccess;
using BookStorage.DataAccess.Entites;
using BookStore.Core.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace BookStorage.DataAccess.Reposotories;

public class UserRepository(BookStorageDbContext context) : IUserRepository
{
    public async Task<List<User>> GetUsers()
    {
        var userEntities = await context.Users
            .AsNoTracking()
            .ToListAsync();

        var users = userEntities
            .Select(u =>
            {
                var (user, error) = User.Create(
                    u.Id,
                    u.Username,
                    u.Email,
                    u.Password,
                    Enum.TryParse<UserRole>(u.Role, out var role) ? role : UserRole.User
                );

                if (!string.IsNullOrEmpty(error))
                    throw new InvalidOperationException($"Invalid user data for {u.Username}: {error}");

                return user;
            })
            .ToList();

        return users;
    }
    
    public async Task<Guid> UpdateUser(Guid id, string username, string email, UserRole role)
    {
        await context.Users
            .Where(u => u.Id == id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(u => u.Username, username)
                .SetProperty(u => u.Email, email.ToLower())
                .SetProperty(u => u.Role, role.ToString()));
        
        return id;
    }
    
    public async Task<Guid> CreateUser(User user)
    {
        var userEntity = new UserEntity
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            Password = user.Password,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt
        };
        
        await context.Users.AddAsync(userEntity);
        await context.SaveChangesAsync();

        return userEntity.Id;
    }

    public async Task<Guid> DeleteUser(Guid id)
    {
        await context.Users
            .Where(u => u.Id == id)
            .ExecuteDeleteAsync();
        
        return id;
    }

}