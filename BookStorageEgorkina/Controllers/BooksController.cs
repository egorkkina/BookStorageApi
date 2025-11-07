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
            .Select(b => new BooksResponse(
                b.Id,
                b.Title,
                b.Description,
                b.Authors.Select(a => a.Name).ToList(),
                b.Price
            ))
            .ToList();
        
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Guid>> GetBookById(Guid id)
    {
        var book = await _bookService.GetBookById(id);
        if (book == null)
            return NotFound($"Book with ID {id} not found");

        var response = new BooksResponse(
            book.Id,
            book.Title,
            book.Description,
            book.Authors.Select(a => a.Name).ToList(),
            book.Price
        );

        return Ok(response);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] BooksRequest request)
    {
        var bookId = await _bookService.CreateBooks(request.Title, request.Description, request.Price, request.Authors);
        return Ok(bookId);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Guid>> Update(Guid id, [FromBody] BooksRequest request)
    {
        try
        {
            var authors = request.Authors?.Select(a => Author.Create(Guid.NewGuid(), a).author).ToList() 
                          ?? new List<Author>();

            var bookId = await _bookService.UpdateBooks(id, request.Title, request.Description, authors, request.Price);
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
            await _bookService.DeleteBooks(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("author/{author}")]
    public async Task<ActionResult<List<BooksResponse>>> GetBooksByAuthor(string author)
    {
        var books = await _bookService.GetBookByAuthor(author);
        var response = books.Select(b => new BooksResponse(
            b.Id,
            b.Title,
            b.Description,
            b.Authors.Select(a => a.Name).ToList(),
            b.Price
        )).ToList();

        return Ok(response);
    }
    
}