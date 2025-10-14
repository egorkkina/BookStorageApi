using BookStore.Core.Abstractions;
using BookStore.Core.Models;

namespace BookStorage.Application;

public class BookReviewService : IBookReviewService
{
    private readonly IBookReviewRepository _reviewRepository;
    private readonly IBookRepository _bookRepository;
    private readonly IUserRepository _userRepository;
    
    public BookReviewService(IBookReviewRepository reviewRepository, IBookRepository bookRepository,
        IUserRepository userRepository)
    {
        _reviewRepository = reviewRepository;
        _bookRepository = bookRepository;
        _userRepository = userRepository;
    }
    
    public async Task<List<BookReview>> GetAllReviews()
    {
        return await _reviewRepository.GetReviews();
    }

    public async Task<List<BookReview>> GetReviewsForBook(Guid bookId)
    {
        var allReviews = await _reviewRepository.GetReviews();
        return allReviews.Where(r => r.BookId == bookId).ToList();
    }

    public async Task<List<BookReview>> GetReviewsByUser(Guid userId)
    {
        var allReviews = await _reviewRepository.GetReviews();
        return allReviews.Where(r => r.UserId == userId).ToList();
    }

    public async Task<Guid> CreateReview(BookReview review)
    {
        var books = await _bookRepository.GetBook();
        var book = books.FirstOrDefault(b => b.Id == review.BookId);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {review.BookId} not found");

        var users = await _userRepository.GetUsers();
        var user = users.FirstOrDefault(u => u.Id == review.UserId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {review.UserId} not found");

        // Проверка, не оставлял ли пользователь уже отзыв на эту книгу
        var userReviews = await GetReviewsByUser(review.UserId);
        if (userReviews.Any(r => r.BookId == review.BookId))
            throw new InvalidOperationException("User has already reviewed this book");
        
        return await _reviewRepository.CreateReview(review);

    }

    public async Task<BookReview> UpdateReview(Guid reviewId, string reviewText, int rating)
    {
        var allReviews = await _reviewRepository.GetReviews();
        var existingReview = allReviews.FirstOrDefault(r => r.Id == reviewId);
        
        if (existingReview == null)
            throw new KeyNotFoundException($"Review with ID {reviewId} not found");

        // Валидация новых данных
        if (rating < 1 || rating > 5)
            throw new ArgumentException("Rating must be between 1 and 5 stars");

        if (string.IsNullOrWhiteSpace(reviewText) || reviewText.Length > BookReview.MAX_REVIEW_LENGTH)
            throw new ArgumentException($"Review text is required and must be under {BookReview.MAX_REVIEW_LENGTH} characters");

        await _reviewRepository.UpdateReview(reviewId, reviewText, rating);
        
        var (updatedReview, _) = BookReview.CreateBookReview(
            existingReview.BookId,
            existingReview.UserId,
            reviewText,
            rating,
            existingReview.IsVerified
        );

        return updatedReview;
    }

    public async Task DeleteReview(Guid reviewId)
    {
        var allReviews = await _reviewRepository.GetReviews();
        var existingReview = allReviews.FirstOrDefault(r => r.Id == reviewId);
        
        if (existingReview == null)
            throw new KeyNotFoundException($"Review with ID {reviewId} not found");

        await _reviewRepository.DeleteReview(reviewId);
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