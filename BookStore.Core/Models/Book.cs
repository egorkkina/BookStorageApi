namespace BookStore.Core.Models;

public class Book
{
    public const int MAX_LENGTH_TITLE = 200;
    public const int MAX_LENGTH_DESCRIPTION = 1000;
    public const int MAX_LENGTH_AUTHOR = 50;
    
    private Book(Guid id, string title, string description, string author, decimal price)
    {
        Id = id;
        Title = title;
        Description = description;
        Author = author;
        Price = price;
    }
    
    public Guid Id { get; }
    public string Title { get; } = string.Empty;
    public string Author { get; } = string.Empty;
    public string Description { get; } = string.Empty;
    public decimal Price { get; }

    public static (Book book, string Error) Create(Guid id, string title, string description, string author,
        decimal price)
    {
        var error = string.Empty;

        if (string.IsNullOrEmpty(title) || string.IsNullOrEmpty(description) || string.IsNullOrEmpty(author) ||
            price <= 0)
        {
            error = "string not be is empty";
        }

        if (title.Length > MAX_LENGTH_TITLE || description.Length > MAX_LENGTH_DESCRIPTION ||
            author.Length > MAX_LENGTH_AUTHOR)
        {
            error = "string is too long";
        }
        
        var book = new Book(id, title, description, author, price);
        
        return (book, error);
    }
}