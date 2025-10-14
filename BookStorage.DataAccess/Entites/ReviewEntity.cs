namespace BookStorage.DataAccess.Entites;

public class ReviewEntity
{
    public Guid Id { get; set; }
    public Guid BookId { get; set; }
    public Guid UserId { get; set; }
    public string ReviewText { get; set; } = string.Empty;
    public int Rating { get; set; }
    public DateTime Created { get; set; }
    public DateTime? Updated { get; set; }
    public bool IsVerified { get; set; }
    
    public BookEntity? Book { get; set; }
    public UserEntity? User { get; set; }
}