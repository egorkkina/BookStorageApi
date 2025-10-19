namespace BookStorageEgorkina.Contracts;

public record BooksRequest(
    string Title,
    string Description,
    List<string> Authors,
    decimal Price
    );