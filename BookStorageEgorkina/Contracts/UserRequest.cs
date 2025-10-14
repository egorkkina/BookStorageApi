using BookStore.Core.Models;

namespace BookStorageEgorkina.Contracts;

public record UserRequest(
    string Username,
    string Email,
    string Password,
    UserRole Role = UserRole.User
    );