namespace BookStorageEgorkina.Contracts;

public record BooksRequest(
    string Title,
    string Description,
    string Author,
    decimal Price
    );