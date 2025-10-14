namespace BookStorageEgorkina.Contracts;

public record AuthRequest(
    string Email,
    string Password
    );