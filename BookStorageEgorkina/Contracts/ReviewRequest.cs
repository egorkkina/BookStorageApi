namespace BookStorageEgorkina.Contracts;

public record ReviewRequest(
    Guid BookId,
    Guid UserId,
    string ReviewText,
    int Rating,
    bool IsVerified
    );