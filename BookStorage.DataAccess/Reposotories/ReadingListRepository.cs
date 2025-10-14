using System.Reflection;
using BookStore.Core.Models;
using BookStorage.DataAccess;
using BookStorage.DataAccess.Entites;
using BookStore.Core.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace BookStorage.DataAccess.Reposotories;

public class ReadingListRepository : IReadingListRepository
{
    private readonly BookStorageDbContext _context;

    public ReadingListRepository(BookStorageDbContext context)
    {
        _context = context;
    }
    
    public async Task<List<ReadingList>> GetReadingLists()
    {
        var listEntities = await _context.ReadingLists
            .AsNoTracking()
            .Include(rl => rl.ReadingListBooks)
            .ToListAsync();

        var readingLists = listEntities
            .Select(rl => 
            {
                var (readingList, error) = ReadingList.Create(
                    rl.Id, 
                    rl.ReadingListName, 
                    rl.UserId,
                    rl.ReadingListDescription, 
                    rl.IsPublic
                );
                
                // Добавляем ID книг через reflection
                var bookIds = rl.ReadingListBooks.Select(rlb => rlb.BookId).ToList();
                SetBookIds(readingList, bookIds);
                
                return readingList;
            })
            .ToList();
    
        return readingLists;
    }
    
    public async Task<ReadingList?> GetReadingListById(Guid id)
    {
        var listEntity = await _context.ReadingLists
            .AsNoTracking()
            .Include(rl => rl.ReadingListBooks)
            .FirstOrDefaultAsync(rl => rl.Id == id);

        if (listEntity == null)
            return null;

        var (readingList, error) = ReadingList.Create(
            listEntity.Id, 
            listEntity.ReadingListName, 
            listEntity.UserId,
            listEntity.ReadingListDescription, 
            listEntity.IsPublic
        );

        var bookIds = listEntity.ReadingListBooks.Select(rlb => rlb.BookId).ToList();
        SetBookIds(readingList, bookIds);

        return readingList;
    }

    public async Task<Guid> CreateReadingList(ReadingList readingList)
    {
        var listEntity = new ReadingListEntity
        {
            Id = readingList.Id,
            UserId = readingList.UserId,
            ReadingListName = readingList.ReadingListName,
            ReadingListDescription = readingList.ReadingListDescription,
            IsPublic = readingList.IsPublic
        };

        await _context.ReadingLists.AddAsync(listEntity);
        foreach (var bookId in readingList.BookIds)
        {
            var readingListBookEntity = new ReadingListBookEntity
            {
                ReadingListId = readingList.Id,
                BookId = bookId
            };
            await _context.ReadingListBooks.AddAsync(readingListBookEntity);
        }
    
        await _context.SaveChangesAsync();

        return listEntity.Id;
    }

    public async Task<Guid> UpdateReadingList(Guid id, string name, string description, bool isPublic)
    {
        await _context.ReadingLists
            .Where(rl => rl.Id == id)
            .ExecuteUpdateAsync(s => s
                .SetProperty(rl => rl.ReadingListName, name)
                .SetProperty(rl => rl.ReadingListDescription, description)
                .SetProperty(rl => rl.IsPublic, isPublic));

        return id;
    }

    public async Task<Guid> DeleteReadingList(Guid id)
    {
        await _context.ReadingListBooks
            .Where(rlb => rlb.ReadingListId == id)
            .ExecuteDeleteAsync();
        
        await _context.ReadingLists
            .Where(rl => rl.Id == id)
            .ExecuteDeleteAsync();

        return id;
    }
    
    private static void SetBookIds(ReadingList readingList, List<Guid> bookIds)
    {
        var field = typeof(ReadingList).GetField("_bookIds", 
            BindingFlags.NonPublic | BindingFlags.Instance);
        
        if (field != null)
        {
            var bookIdsList = (List<Guid>)field.GetValue(readingList)!;
            bookIdsList.Clear();
            bookIdsList.AddRange(bookIds);
        }
    }
    
    public async Task<Guid> AddBookToReadingList(Guid readingListId, Guid bookId)
    {
        var readingListBookEntity = new ReadingListBookEntity
        {
            ReadingListId = readingListId,
            BookId = bookId
        };

        await _context.ReadingListBooks.AddAsync(readingListBookEntity);
        await _context.SaveChangesAsync();

        return readingListBookEntity.ReadingListId;
    }
    
    public async Task<Guid> RemoveBookFromReadingList(Guid readingListId, Guid bookId)
    {
        await _context.ReadingListBooks
            .Where(rlb => rlb.ReadingListId == readingListId && rlb.BookId == bookId)
            .ExecuteDeleteAsync();

        return readingListId;
    }
    
    public async Task<List<Guid>> GetBooksInReadingList(Guid readingListId)
    {
        var bookIds = await _context.ReadingListBooks
            .Where(rlb => rlb.ReadingListId == readingListId)
            .Select(rlb => rlb.BookId)
            .ToListAsync();

        return bookIds;
    }
    
    public async Task<bool> IsBookInReadingList(Guid readingListId, Guid bookId)
    {
        return await _context.ReadingListBooks
            .AnyAsync(rlb => rlb.ReadingListId == readingListId && rlb.BookId == bookId);
    }

}