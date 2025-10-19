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
        var books = await _context.Books
            .Include(b => b.BookAuthors)
            .ThenInclude(ba => ba.Author)
            .AsNoTracking()
            .ToListAsync();

        return books.Select(b =>
        {
            var (book, _) = Book.Create(b.Id, b.Title, b.Description, b.Price);
            foreach (var ba in b.BookAuthors)
            {
                var (author, _) = Author.Create(ba.AuthorId, ba.Author.Name);
                book.AddAuthor(author);
            }
            return book;
        }).ToList();
    }
    
    public async Task<Guid> CreateBook(Book book, List<Author> authors)
    {
        var bookEntity = new BookEntity
        {
            Id = book.Id,
            Title = book.Title,
            Description = book.Description,
            Price = book.Price,
        };

        foreach (var author in authors)
        {
            var existingAuthor = await _context.Authors.FindAsync(author.Id);
            if (existingAuthor == null)
            {
                existingAuthor = new AuthorEntity { Id = author.Id, Name = author.Name };
                await _context.Authors.AddAsync(existingAuthor);
            }

            bookEntity.BookAuthors.Add(new BookAuthorEntity
            {
                Book = bookEntity,
                Author = existingAuthor
            });
        }

        await _context.Books.AddAsync(bookEntity);
        await _context.SaveChangesAsync();
        return bookEntity.Id;
    }

    public async Task<Guid> UpdateBook(Guid id, string title, string description, decimal price, List<Author> authors)
    {
        var bookEntity = await _context.Books
            .Include(b => b.BookAuthors)
            .ThenInclude(ba => ba.Author)
            .FirstOrDefaultAsync(b => b.Id == id);
        
        bookEntity.Title = title;
        bookEntity.Description = description;
        bookEntity.Price = price;

        var oldAuthors = bookEntity.BookAuthors.ToList();

        bookEntity.BookAuthors.Clear();

        foreach (var author in authors)
        {
            var existingAuthor = await _context.Authors.FindAsync(author.Id);
            if (existingAuthor == null)
            {
                existingAuthor = new AuthorEntity { Id = author.Id, Name = author.Name };
                await _context.Authors.AddAsync(existingAuthor);
            }

            bookEntity.BookAuthors.Add(new BookAuthorEntity
            {
                BookId = bookEntity.Id,
                AuthorId = existingAuthor.Id
            });
        }

        await _context.SaveChangesAsync();

        foreach (var oldAuthor in oldAuthors)
        {
            var isUsed = await _context.BookAuthors
                .AnyAsync(ba => ba.AuthorId == oldAuthor.AuthorId);
            if (!isUsed)
            {
                var authorEntity = await _context.Authors.FindAsync(oldAuthor.AuthorId);
                if (authorEntity != null)
                    _context.Authors.Remove(authorEntity);
            }
        }

        await _context.SaveChangesAsync();
        return bookEntity.Id;
    }

    public async Task<Guid> DeleteBook(Guid id)
    {
        var bookEntity = await _context.Books.FindAsync(id);

        _context.Books.Remove(bookEntity);
        await _context.SaveChangesAsync();
        return id;
    }
}