using BookStore.Core.Abstractions;
using BookStore.Core.Models;

namespace BookStorage.Application;

public class BookReviewService(
    IBookReviewRepository reviewRepository,
    IBookRepository bookRepository,
    IUserRepository userRepository)
    : IBookReviewService
{
    public async Task<List<BookReview>> GetAllReviews()
    {
        return await reviewRepository.GetReviews();
    }

    public async Task<List<BookReview>> GetReviewsForBook(Guid bookId)
    {
        var allReviews = await reviewRepository.GetReviews();
        return allReviews.Where(r => r.BookId == bookId).ToList();
    }

    public async Task<List<BookReview>> GetReviewsByUser(Guid userId)
    {
        var allReviews = await reviewRepository.GetReviews();
        return allReviews.Where(r => r.UserId == userId).ToList();
    }

    public async Task<Guid> CreateReview(BookReview review)
    {
        var books = await bookRepository.GetBook();
        var book = books.FirstOrDefault(b => b.Id == review.BookId);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {review.BookId} not found");

        var users = await userRepository.GetUsers();
        var user = users.FirstOrDefault(u => u.Id == review.UserId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {review.UserId} not found");

        var userReviews = await GetReviewsByUser(review.UserId);
        if (userReviews.Any(r => r.BookId == review.BookId))
            throw new InvalidOperationException("User has already reviewed this book");
        
        return await reviewRepository.CreateReview(review);
    }

    public async Task<BookReview> UpdateReview(Guid reviewId, string reviewText, int rating)
    {
        var review = (await reviewRepository.GetReviews())
            .FirstOrDefault(r => r.Id == reviewId);
    
        if (review == null)
            throw new KeyNotFoundException($"Review with ID {reviewId} not found");

        var (updatedReview, error) = BookReview.CreateBookReview(
            review.Id,
            review.BookId,
            review.UserId,
            reviewText,
            rating,
            review.IsVerified
        );

        if (!string.IsNullOrEmpty(error))
            throw new ArgumentException(error);
        
        await reviewRepository.UpdateReview(reviewId, updatedReview.ReviewText, updatedReview.Rating);

        return updatedReview;
    }

    public async Task DeleteReview(Guid reviewId)
    {
        var allReviews = await reviewRepository.GetReviews();
        var existingReview = allReviews.FirstOrDefault(r => r.Id == reviewId);
        
        if (existingReview == null)
            throw new KeyNotFoundException($"Review with ID {reviewId} not found");

        await reviewRepository.DeleteReview(reviewId);
    }

    public async Task<double> GetAverageRatingForBook(Guid bookId)
    {
        var reviews = await GetReviewsForBook(bookId);
        
        if (!reviews.Any())
            return 0;

        return reviews.Average(r => r.Rating);
    }

    public async Task<int> GetReviewCountForBook(Guid bookId)
    {
        var reviews = await GetReviewsForBook(bookId);
        return reviews.Count;
    }

    public async Task<bool> HasUserReviewedBook(Guid userId, Guid bookId)
    {
        var userReviews = await GetReviewsByUser(userId);
        return userReviews.Any(r => r.BookId == bookId);
    }
}