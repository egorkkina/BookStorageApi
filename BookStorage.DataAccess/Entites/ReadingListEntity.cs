using System.ComponentModel.DataAnnotations.Schema;

namespace BookStorage.DataAccess.Entites;

public class ReadingListEntity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string ReadingListName { get; set; } = string.Empty;
    public string ReadingListDescription { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    
    public UserEntity User { get; set; } = null!;
    public List<ReadingListBookEntity> ReadingListBooks { get; set; } = new();
    
}