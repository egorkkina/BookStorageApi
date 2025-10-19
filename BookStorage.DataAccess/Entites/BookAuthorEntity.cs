namespace BookStorage.DataAccess.Entites;

public class BookAuthorEntity
{
    public Guid BookId { get; set; }
    public BookEntity Book { get; set; } = null!;

    public Guid AuthorId { get; set; }
    public AuthorEntity Author { get; set; } = null!;
}