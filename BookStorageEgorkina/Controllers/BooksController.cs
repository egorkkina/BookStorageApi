using BookStorageEgorkina.Contracts;
using BookStore.Core.Abstractions;
using BookStore.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStorageEgorkina.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly IBookService _bookService;
    
    public BooksController(IBookService bookService)
    {
        _bookService = bookService;
    }

    [HttpGet]
    public async Task<ActionResult<List<BooksResponse>>> GetAll()
    {
        var books = await _bookService.GetAllBooks();

        var response = books
            .Select(b => new BooksResponse(b.Id, b.Title, b.Description, b.Author, b.Price));
        
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Guid>> GetBookById(Guid id)
    {
        var books = await _bookService.GetAllBooks();
        
        var book = books.FirstOrDefault(b => b.Id == id);
        if (book == null)
            return NotFound($"Book with ID {id} not found");

        return Ok(book);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] BooksRequest request)
    {
        var (book, error) = Book.Create(
            Guid.NewGuid(),
            request.Title,
            request.Description,
            request.Author,
            request.Price);

        if (!string.IsNullOrEmpty(error))
        {
            return BadRequest(error);
        }

        var bookId = await _bookService.CreateBooks(book);
        
        return Ok(bookId);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Guid>> Update(Guid id, [FromBody] BooksRequest request)
    {
        try
        {
            var bookId =
                await _bookService.UpdateBooks(id, request.Title, request.Description, request.Author, request.Price);

            return Ok(bookId);
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
            return Ok(await _bookService.DeleteBooks(id));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("author/{author}")]
    public async Task<ActionResult<List<BooksResponse>>> GetBooksByAuthor(string author)
    {
        var books = await _bookService.GetAllBooks();
        
        var bookByAuthor = books
            .Where(a => a.Author.Contains(author, StringComparison.OrdinalIgnoreCase))
            .Select(a => new BooksResponse(a.Id, a.Title, a.Description, a.Author, a.Price))
            .OrderBy(a => a.Author)
            .ToList();

        return Ok(bookByAuthor);
    }
    
}