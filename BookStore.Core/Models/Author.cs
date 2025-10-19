namespace BookStore.Core.Models;

public class Author
{
    public const int MAX_LENGTH_NAME = 50;

    private Author(Guid id, string name)
    {
        Id = id;
        Name = name;
        Books = new List<Book>();
    }
    
    public Guid Id { get; }
    public string Name { get; }

    public List<Book> Books { get; }

    public static (Author author, string Error) Create(Guid id, string name)
    {
        var error = string.Empty;
        if (string.IsNullOrWhiteSpace(name))
            error = "Author name is required";
        if (name.Length > MAX_LENGTH_NAME)
            error = "Author name too long";

        var author = new Author(id, name);
        return (author, error);
    }
}