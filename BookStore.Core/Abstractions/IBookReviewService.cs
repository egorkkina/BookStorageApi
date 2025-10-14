using BookStore.Core.Models;

namespace BookStore.Core.Abstractions;

public interface IBookReviewService
{
    Task<List<BookReview>> GetAllReviews();
    Task<List<BookReview>> GetReviewsForBook(Guid bookId);
    Task<List<BookReview>> GetReviewsByUser(Guid userId);
    Task<Guid> CreateReview(BookReview review);
    Task<BookReview> UpdateReview(Guid reviewId, string reviewText, int rating);
    Task DeleteReview(Guid reviewId);
    Task<double> GetAverageRatingForBook(Guid bookId);
    Task<int> GetReviewCountForBook(Guid bookId);
    Task<bool> HasUserReviewedBook(Guid userId, Guid bookId);
}