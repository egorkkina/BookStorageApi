namespace BookStorageEgorkina.Contracts;

public record BooksResponse(
    Guid Id,
    string Title,
    string Description,
    List<string> Authors,
    decimal Price
    );
    