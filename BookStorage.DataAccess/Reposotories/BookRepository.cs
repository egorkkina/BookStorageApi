using BookStore.Core.Models;
using BookStorage.DataAccess;
using BookStorage.DataAccess.Entites;
using BookStore.Core.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace BookStorage.DataAccess.Reposotories;

public class BookRepository : IBookRepository
{
    private readonly BookStorageDbContext _context;

    public BookRepository(BookStorageDbContext context)
    {
        _context = context;
    }

    public async Task<List<Book>> GetBook()
    {
        var bookEntities = await _context.Books
            .AsNoTracking()
            .ToListAsync();

        var books = bookEntities
            .Select(b => Book.Create(b.Id, b.Title, b.Description, b.Author, b.Price).book)
            .ToList();
    
        return books;
    }
    
    public async Task<Guid> CreateBook(Book book)
    {
        var bookEntity = new BookEntity
        {
            Id = book.Id,
            Title = book.Title,
            Description = book.Description,
            Author = book.Author,
            Price = book.Price
        };
        
        await _context.Books.AddAsync(bookEntity);
        await _context.SaveChangesAsync();

        return bookEntity.Id;
    }

    public async Task<Guid> UpdateBook(Guid id, string title, string description, string author, decimal price)
    {
        await _context.Books
            .Where(b => b.Id == id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(b => b.Title, title)
                .SetProperty(b => b.Description, description)
                .SetProperty(b => b.Author, author)
                .SetProperty(b => b.Price, price));
        
        return id;
    }

    public async Task<Guid> DeleteBook(Guid id)
    {
        await _context.Books
            .Where(b => b.Id == id)
            .ExecuteDeleteAsync();
        
        return id;
    }
}