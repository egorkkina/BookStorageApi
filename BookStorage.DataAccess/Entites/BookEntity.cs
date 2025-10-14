namespace BookStorage.DataAccess.Entites;

public class BookEntity
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    
    public List<ReadingListBookEntity> ReadingListBooks { get; set; } = new();
}