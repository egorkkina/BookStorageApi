namespace BookStorageEgorkina.Contracts;

public record ReadingListRequest(
    Guid UserId,
    string ReadingListName,
    string ReadingListDescription,
    bool IsPublic,
    List<Guid> BookIds
    );