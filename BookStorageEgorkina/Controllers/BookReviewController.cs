using BookStorageEgorkina.Contracts;
using BookStore.Core.Abstractions;
using BookStore.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStorageEgorkina.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BookReviewController : ControllerBase
{
    private readonly IBookReviewService _bookReviewService;

    public BookReviewController(IBookReviewService bookReviewService)
    {
        _bookReviewService = bookReviewService;
    }
    
    [HttpGet]
    public async Task<ActionResult<List<ReviewResponse>>> GetAll()
    {
        var reviews = await _bookReviewService.GetAllReviews();

        var response = reviews
            .Select(r => new ReviewResponse(
                r.Id, r.BookId, r.UserId, r.ReviewText, r.Rating, r.IsVerified));
        
        return Ok(response);
    }
    
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ReviewResponse>> GetReviewById(Guid id)
    {
        var allReviews = await _bookReviewService.GetAllReviews();
        var review = allReviews.FirstOrDefault(r => r.Id == id);
        
        if (review == null)
            return NotFound($"Review with ID {id} not found");

        var response = new ReviewResponse(
            review.Id, review.BookId, review.UserId, review.ReviewText, 
            review.Rating, review.IsVerified);
        
        return Ok(response);
    }
    
    [HttpGet("book/{bookId:guid}")]
    public async Task<ActionResult<List<ReviewResponse>>> GetReviewsByBook(Guid bookId)
    {
        try
        {
            var reviews = await _bookReviewService.GetReviewsForBook(bookId);

            var response = reviews
                .Select(r => new ReviewResponse(
                    r.Id, r.BookId, r.UserId, r.ReviewText, 
                    r.Rating, r.IsVerified));
            
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<List<ReviewResponse>>> GetReviewsByUser(Guid userId)
    {
        try
        {
            var reviews = await _bookReviewService.GetReviewsByUser(userId);

            var response = reviews
                .Select(r => new ReviewResponse(
                    r.Id, r.BookId, r.UserId, r.ReviewText, 
                    r.Rating, r.IsVerified));
            
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] ReviewRequest request)
    {
        try
        {
            var (review, error) = BookReview.CreateBookReview(
                Guid.NewGuid(), 
                request.BookId,
                request.UserId,
                request.ReviewText,
                request.Rating,
                request.IsVerified);

            if (!string.IsNullOrEmpty(error))
                return BadRequest(error);

            var reviewId = await _bookReviewService.CreateReview(review);
        
            return Ok(reviewId);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ReviewResponse>> Update(Guid id, [FromBody] ReviewRequest request)
    {
        try
        {
            var updatedReview = await _bookReviewService.UpdateReview(id, request.ReviewText, request.Rating);

            var response = new ReviewResponse(
                updatedReview.Id, updatedReview.BookId, updatedReview.UserId,
                updatedReview.ReviewText, updatedReview.Rating, updatedReview.IsVerified);

            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            await _bookReviewService.DeleteReview(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [HttpGet("book/{bookId:guid}/average-rating")]
    public async Task<ActionResult<double>> GetAverageRating(Guid bookId)
    {
        try
        {
            var rating = await _bookReviewService.GetAverageRatingForBook(bookId);
            return Ok(rating);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [HttpGet("book/{bookId:guid}/count")]
    public async Task<ActionResult<int>> GetReviewCount(Guid bookId)
    {
        try
        {
            var count = await _bookReviewService.GetReviewCountForBook(bookId);
            return Ok(count);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [HttpGet("user/{userId:guid}/book/{bookId:guid}/has-reviewed")]
    public async Task<ActionResult<bool>> HasUserReviewedBook(Guid userId, Guid bookId)
    {
        try
        {
            var hasReviewed = await _bookReviewService.HasUserReviewedBook(userId, bookId);
            return Ok(hasReviewed);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
}