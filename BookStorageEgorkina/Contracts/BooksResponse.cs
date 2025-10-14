namespace BookStorageEgorkina.Contracts;

public record BooksResponse(
    Guid Id,
    string Title,
    string Description,
    string Author,
    decimal Price
    );
    