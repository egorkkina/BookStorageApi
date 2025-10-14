namespace BookStorageEgorkina.Contracts;

public record ReadingListResponse(
    Guid Id,
    Guid UserId,
    string ReadingListName,
    string ReadingListDescription,
    bool IsPublic,
    IReadOnlyList<Guid> BookIds
    );