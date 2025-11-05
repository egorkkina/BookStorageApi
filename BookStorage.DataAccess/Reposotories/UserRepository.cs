using BookStore.Core.Models;
using BookStorage.DataAccess;
using BookStorage.DataAccess.Entites;
using BookStore.Core.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace BookStorage.DataAccess.Reposotories;

public class UserRepository : IUserRepository
{
    private readonly BookStorageDbContext _context;
    
    public UserRepository(BookStorageDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<User>> GetUsers()
    {
        var userEntities = await _context.Users
            .AsNoTracking()
            .ToListAsync();

        var users = userEntities
            .Select(u => User.Create(u.Username, u.Email, u.Password, Enum.Parse<UserRole>(u.Role)).user)
            .ToList();
    
        return users;
    }
    
    public async Task<Guid> UpdateUser(Guid id, string username, string email, UserRole role)
    {
        await _context.Users
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
        
        await _context.Users.AddAsync(userEntity);
        await _context.SaveChangesAsync();

        return userEntity.Id;
    }

    public async Task<Guid> DeleteUser(Guid id)
    {
        await _context.Users
            .Where(u => u.Id == id)
            .ExecuteDeleteAsync();
        
        return id;
    }

}