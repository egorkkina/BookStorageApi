namespace BookStore.Core.Models;

public class Book
{
    public const int MAX_LENGTH_TITLE = 200;
    public const int MAX_LENGTH_DESCRIPTION = 1000;
    
    private Book(Guid id, string title, string description, decimal price, List<Author>? authors = null)
    {
        Id = id;
        Title = title;
        Description = description;
        Authors = authors ?? new List<Author>();
        Price = price;
    }
    
    public Guid Id { get; }
    public string Title { get; } = string.Empty;
    public List<Author> Authors { get; } = new();
    public string Description { get; } = string.Empty;
    public decimal Price { get; }

    public static (Book book, string Error) Create(Guid id, string title, string description, decimal price, 
        List<Author>? authors = null)
    {
        var error = string.Empty;
        
        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(description) || price < 0)
            error = "Title, description must not be empty and price > 0";

        if (title.Length > MAX_LENGTH_TITLE || description.Length > MAX_LENGTH_DESCRIPTION)
            error = "Title or description too long";
        
        var book = new Book(id, title, description, price, authors);
        
        return (book, error);
    }
}