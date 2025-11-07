namespace BookStore.Core.Models;

public class User
{
    public const int MAX_USERNAME_LENGTH = 20;
    
    public Guid Id { get; }
    public string Username { get; }
    public string Email { get; }
    public string Password { get; }
    public UserRole Role { get; }
    public DateTime CreatedAt { get; }
    
    private User(Guid id, string username, string email, string password, UserRole role)
    {
        Id = id;
        Username = username;
        Email = email;
        Password = password;
        Role = role;
        CreatedAt = DateTime.UtcNow;
    }

    public static (User user, string Error) Create(Guid id, string username,
        string email, string password, UserRole role = UserRole.User)
    {
        var error = string.Empty;
        
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            error = "Valid email is required";
        
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            error = "Password must be at least 4 characters";
        
        var user = new User(id, username.Trim(), email.Trim().ToLower(), password, role);
        return (user, error);
    }
    
    public bool VerifyPassword(string password)
    {
        return Password == password;
    }
    
    public bool IsAdmin() => Role == UserRole.Admin;
    
}