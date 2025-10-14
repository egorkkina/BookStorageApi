namespace BookStorageEgorkina.Contracts;

public record ReviewResponse(
    Guid Id,
    Guid BookId,
    Guid UserId,
    string ReviewText,
    int Rating,
    bool IsVerified
);