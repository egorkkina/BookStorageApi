using Microsoft.AspNetCore.Mvc;
using BookStorageEgorkina.Contracts;
using BookStore.Core.Abstractions;
using BookStore.Core.Models;
using Microsoft.AspNetCore.Authorization;

namespace BookStorageEgorkina.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly IReadingListService _readingListService;
    private readonly IBookService _bookService;
    private readonly IUserService _userService;
    private readonly IBookReviewService _bookReviewService;

    public AnalyticsController(
        IReadingListService readingListService,
        IBookService bookService,
        IUserService userService,
        IBookReviewService bookReviewService) 
    {
        _readingListService = readingListService;
        _bookService = bookService;
        _userService = userService;
        _bookReviewService = bookReviewService;
    }
    
    [HttpGet("lists-containing-book/{bookId:guid}")]
    [Authorize]
    public async Task<ActionResult> GetListsContainingBook(Guid bookId)
    {
        var readingLists = await _readingListService.GetAllReadingLists();
        var users = await _userService.GetUsers();
        var books = await _bookService.GetAllBooks();

        var book = books.FirstOrDefault(b => b.Id == bookId);
        if (book == null)
            return NotFound($"Book with ID {bookId} not found");

        var result = readingLists
            .Where(rl => rl.BookIds.Contains(bookId))
            .Select(rl => new
            {
                ReadingListId = rl.Id,
                ReadingListName = rl.ReadingListName,
                Owner = users.FirstOrDefault(u => u.Id == rl.UserId)?.Username ?? "Unknown",
                OwnerEmail = users.FirstOrDefault(u => u.Id == rl.UserId)?.Email ?? "Unknown",
                IsPublic = rl.IsPublic,
                TotalBooksInList = rl.BookIds.Count,
                ContainsTargetBook = true
            })
            .OrderByDescending(rl => rl.TotalBooksInList)
            .ToList();

        return Ok(new
        {
            Book = new { book.Id, book.Title, book.Author },
            FoundInLists = result
        });
    }
    
    [HttpGet("user-book-counts")]
    [AllowAnonymous]
    public async Task<ActionResult> GetUserBookCounts()
    {
        var users = await _userService.GetUsers();
        var readingLists = await _readingListService.GetAllReadingLists();
        var result = users
            .Select(user => new
            {
                UserId = user.Id,
                Username = user.Username,
                TotalBooks = readingLists
                    .Where(rl => rl.UserId == user.Id)
                    .Sum(rl => rl.BookIds.Count)
            })
            .OrderByDescending(x => x.TotalBooks)
            .ToList();

        return Ok(result);
    }
    
    [HttpGet("top-rated-books")]
    public async Task<ActionResult> GetTopRatedBooks()
    {
        var books = await _bookService.GetAllBooks();
        var reviews = await _bookReviewService.GetAllReviews();

        if (!books.Any() || !reviews.Any())
            return NotFound("No books or reviews found.");

        var result = books
            .Select(book => new
            {
                book.Id,
                book.Title,
                book.Author,
                AverageRating = reviews
                    .Where(r => r.BookId == book.Id)
                    .Select(r => r.Rating)
                    .DefaultIfEmpty(0)
                    .Average(),
                ReviewCount = reviews.Count(r => r.BookId == book.Id)
            })
            .OrderByDescending(b => b.AverageRating)
            .ThenByDescending(b => b.ReviewCount)
            .Take(10)
            .ToList();

        return Ok(result);
    }
}