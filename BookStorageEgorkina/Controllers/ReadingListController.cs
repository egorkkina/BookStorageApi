using System.Reflection;
using BookStorageEgorkina.Contracts;
using BookStore.Core.Abstractions;
using BookStore.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BookStorageEgorkina.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ReadingListController : ControllerBase
{
    private readonly IReadingListService _readingListService;
    
    public ReadingListController(IReadingListService readingListService)
    {
        _readingListService = readingListService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ReadingListResponse>>> GetAll()
    {
        var readingLists = await _readingListService.GetAllReadingLists();

        var response = readingLists
            .Select(rl => new ReadingListResponse(
                rl.Id, rl.UserId, rl.ReadingListName, rl.ReadingListDescription, rl.IsPublic, rl.BookIds));
        
        return Ok(response);
    }
    
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ReadingListResponse>> GetReadingListById(Guid id)
    {
        var readingList = await _readingListService.GetReadingListById(id);
        if (readingList == null)
            return NotFound($"Reading list with ID {id} not found");

        var response = new ReadingListResponse(
            readingList.Id, readingList.UserId, readingList.ReadingListName, 
            readingList.ReadingListDescription, readingList.IsPublic, readingList.BookIds);
        
        return Ok(response);
    }
    
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<List<ReadingListResponse>>> GetReadingListsByUser(Guid userId)
    {
        try
        {
            var readingLists = await _readingListService.GetReadingListsByUser(userId);

            var response = readingLists
                .Select(rl => new ReadingListResponse(
                    rl.Id, rl.UserId, rl.ReadingListName, 
                    rl.ReadingListDescription, rl.IsPublic, rl.BookIds));
            
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Guid>> Create([FromBody] ReadingListRequest request)
    {
        try
        {
            var (readingList, error) = ReadingList.Create(
                Guid.NewGuid(),
                request.ReadingListName,
                request.UserId,
                request.ReadingListDescription,
                request.IsPublic);

            if (!string.IsNullOrEmpty(error))
                return BadRequest(error);
            
            if (request.BookIds is { Count: > 0 })
                readingList.AddBooks(request.BookIds);

            var id = await _readingListService.CreateReadingList(readingList);
            return Ok(id);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Guid>> Update(Guid id, [FromBody] ReadingListRequest request)
    {
        try
        {
            var readingListId = await _readingListService.UpdateReadingList(
                id, request.ReadingListName, request.ReadingListDescription, request.IsPublic);

            return Ok(readingListId);
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
            await _readingListService.DeleteReadingList(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPost("{readingListId:guid}/books/{bookId:guid}")]
    public async Task<ActionResult> AddBook(Guid readingListId, Guid bookId)
    {
        try
        {
            var readingList = await _readingListService.AddBookToReadingList(readingListId, bookId);
            return Ok(readingList.Id);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{readingListId:guid}/books/{bookId:guid}")]
    public async Task<ActionResult> RemoveBook(Guid readingListId, Guid bookId)
    {
        try
        {
            var readingList = await _readingListService.RemoveBookFromReadingList(readingListId, bookId);
            return Ok(readingList.Id);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
    [HttpGet("{readingListId:guid}/books")]
    public async Task<ActionResult<List<BooksResponse>>> GetBooksInReadingList(Guid readingListId)
    {
        try
        {
            var books = await _readingListService.GetBooksInReadingList(readingListId);

            var response = books
                .Select(b => new BooksResponse(b.Id, b.Title, b.Description, b.Authors.Select(a => a.Name).ToList()
                    , b.Price));
            
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [HttpGet("{readingListId:guid}/books/count")]
    public async Task<ActionResult<int>> GetBooksCount(Guid readingListId)
    {
        try
        {
            var count = await _readingListService.GetReadingListBookCount(readingListId);
            return Ok(count);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [HttpGet("{readingListId:guid}/books/{bookId:guid}/exists")]
    public async Task<ActionResult<bool>> IsBookInReadingList(Guid readingListId, Guid bookId)
    {
        try
        {
            var exists = await _readingListService.IsBookInReadingList(readingListId, bookId);
            return Ok(exists);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }
    
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/reports")]
    public async Task<ActionResult> GetAdminReports()
    {
        var allLists = await _readingListService.GetAllReadingLists();
        var publicListsCount = allLists.Count(rl => rl.IsPublic);
        var privateListsCount = allLists.Count(rl => !rl.IsPublic);
    
        return Ok(new {
            TotalLists = allLists.Count,
            PublicLists = publicListsCount,
            PrivateLists = privateListsCount,
            AverageBooksPerList = allLists.Average(rl => rl.BookIds.Count)
        });
    }
}