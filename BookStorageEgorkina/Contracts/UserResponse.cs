using BookStore.Core.Models;

namespace BookStorageEgorkina.Contracts;

public record UserResponse(
        Guid Id,
        string Username,
        string Email,
        UserRole Role
        );