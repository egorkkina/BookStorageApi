using BookStorage.DataAccess.Entites;
using BookStore.Core.Abstractions;
using BookStore.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace BookStorage.DataAccess.Reposotories;

public class BookReviewRepository(BookStorageDbContext context) : IBookReviewRepository
{
    public async Task<List<BookReview>> GetReviews()
    {
        var reviewEntities = await context.Reviews
            .AsNoTracking()
            .ToListAsync();

        var reviews = reviewEntities
            .Select(r => BookReview.CreateBookReview(
                r.Id,
                r.BookId, 
                r.UserId, 
                r.ReviewText, 
                r.Rating, 
                r.IsVerified
            ).bookReview)
            .ToList();

        return reviews;
    }

    public async Task<Guid> CreateReview(BookReview review)
    {
        var reviewEntity = new ReviewEntity
        {
            Id = review.Id,
            BookId = review.BookId,
            UserId = review.UserId,
            ReviewText = review.ReviewText,
            Rating = review.Rating,
            Created = review.Created,
            Updated = review.Updated,
            IsVerified = review.IsVerified
        };

        await context.Reviews.AddAsync(reviewEntity);
        await context.SaveChangesAsync();

        return reviewEntity.Id;
    }

    public async Task<Guid> UpdateReview(Guid id, string reviewText, int rating)
    {
        await context.Reviews
            .Where(r => r.Id == id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(r => r.ReviewText, reviewText)
                .SetProperty(r => r.Rating, rating)
                .SetProperty(r => r.Updated, DateTime.UtcNow));

        return id;
    }

    public async Task<Guid> DeleteReview(Guid id)
    {
        await context.Reviews
            .Where(r => r.Id == id)
            .ExecuteDeleteAsync();

        return id;
    }
}