using BookStore.Core.Models;

namespace BookStore.Core.Abstractions;

public interface IBookReviewRepository
{
    Task<List<BookReview>> GetReviews();
    Task<Guid> CreateReview(BookReview review);
    Task<Guid> UpdateReview(Guid id, string reviewText, int rating);
    Task<Guid> DeleteReview(Guid id);
}