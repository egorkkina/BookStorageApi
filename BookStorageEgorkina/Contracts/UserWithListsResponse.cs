namespace BookStorageEgorkina.Contracts;

public record UserWithListsResponse(
    Guid UserId,
    string Username,
    string Email,
    int ReadingListsCount,
    int TotalBooksInLists,
    int PublicListsCount
    );