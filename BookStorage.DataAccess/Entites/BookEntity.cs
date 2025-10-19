namespace BookStorage.DataAccess.Entites;

public class BookEntity
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    
    public List<BookAuthorEntity> BookAuthors { get; set; } = new();
    public List<ReadingListBookEntity> ReadingListBooks { get; set; } = new();
}