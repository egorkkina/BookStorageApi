namespace BookStorage.DataAccess.Entites;

public class AuthorEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public List<BookAuthorEntity> BookAuthors { get; set; } = new();
}