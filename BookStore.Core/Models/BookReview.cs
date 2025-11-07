namespace BookStore.Core.Models;

public class BookReview
{
    
    public const int MAX_REVIEW_LENGTH = 1000;
    
    public Guid Id { get; }
    public Guid BookId { get; }
    public Guid UserId { get; }
    public string ReviewText { get; }
    public int Rating { get; }
    public DateTime Created { get; }
    public DateTime? Updated { get; }
    public bool IsVerified { get; }

    private BookReview(Guid id, Guid bookId, Guid userId, string reviewText,
        int rating, bool isVerified)
    {
        Id = id;
        BookId = bookId;
        UserId = userId;
        ReviewText = reviewText;
        Rating = rating;
        Created = DateTime.UtcNow;;
        IsVerified = isVerified;
    }

    public static (BookReview bookReview, string Error) CreateBookReview(Guid bookId, Guid userId, 
        string reviewText, int rating, bool isVerifiedPurchase = false)
    {
        var error = string.Empty;
        
        if (rating is < 1 or > 5)
            error = "Rating must be between 1 and 5 stars";

        if (string.IsNullOrWhiteSpace(reviewText) || reviewText.Length > MAX_REVIEW_LENGTH)
            error = "Review text is required and must be under 1000 characters";

        var bookReview = new BookReview(Guid.NewGuid(), bookId, userId, 
            reviewText.Trim(), rating, isVerifiedPurchase);
        
        return (bookReview, error);
    }
}