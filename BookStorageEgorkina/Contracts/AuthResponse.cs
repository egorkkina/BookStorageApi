using BookStore.Core.Models;

namespace BookStorageEgorkina.Contracts;

public record AuthResponse(
    string Token,
    Guid UserId,
    string Username,
    UserRole Role
    );