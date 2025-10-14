namespace BookStorage.DataAccess.Entites;

public class UserEntity
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public DateTime CreatedAt { get; set; }
    
    public List<ReviewEntity> Reviews { get; set; } = new();
    public List<ReadingListEntity> ReadingLists { get; set; } = new();
}