using BookStore.Core.Abstractions;
using BookStore.Core.Models;

namespace BookStorage.Application;

public class ReadingListService : IReadingListService
{
    private readonly IReadingListRepository _readingListRepository;
    private readonly IBookRepository _bookRepository;
    private readonly IUserRepository _userRepository;

    public ReadingListService(
        IReadingListRepository readingListRepository,
        IBookRepository bookRepository,
        IUserRepository userRepository)
    {
        _readingListRepository = readingListRepository;
        _bookRepository = bookRepository;
        _userRepository = userRepository;
    }
    
    public async Task<List<ReadingList>> GetAllReadingLists()
    {
        return await _readingListRepository.GetReadingLists();
    }

    public async Task<ReadingList?> GetReadingListById(Guid id)
    {
        return await _readingListRepository.GetReadingListById(id);
    }

    public async Task<List<ReadingList>> GetReadingListsByUser(Guid userId)
    {
        var allLists = await _readingListRepository.GetReadingLists();
        return allLists.Where(rl => rl.UserId == userId).ToList();
    }

    public async Task<Guid> CreateReadingList(ReadingList readingList)
    {
        var users = await _userRepository.GetUsers();
        var user = users.FirstOrDefault(u => u.Id == readingList.UserId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {readingList.UserId} not found");
        
        return await _readingListRepository.CreateReadingList(readingList);

    }

    public async Task<Guid> UpdateReadingList(Guid id, string name, string description, bool isPublic)
    {
        var existingList = await _readingListRepository.GetReadingListById(id);
        if (existingList == null)
            throw new KeyNotFoundException($"Reading list with ID {id} not found");

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Reading list name is required");

        return await _readingListRepository.UpdateReadingList(id, name, description, isPublic);
    }

    public async Task DeleteReadingList(Guid id)
    {
        var existingList = await _readingListRepository.GetReadingListById(id);
        if (existingList == null)
            throw new KeyNotFoundException($"Reading list with ID {id} not found");

        await _readingListRepository.DeleteReadingList(id);
    }

    public async Task<ReadingList> AddBookToReadingList(Guid readingListId, Guid bookId)
    {
        var readingList = await _readingListRepository.GetReadingListById(readingListId);
        if (readingList == null)
            throw new KeyNotFoundException($"Reading list with ID {readingListId} not found");

        // Проверка существования книги
        var books = await _bookRepository.GetBook();
        var book = books.FirstOrDefault(b => b.Id == bookId);
        if (book == null)
            throw new KeyNotFoundException($"Book with ID {bookId} not found");

        // Проверка, не добавлена ли книга уже в список
        if (await _readingListRepository.IsBookInReadingList(readingListId, bookId))
            throw new InvalidOperationException("Book is already in the reading list");
        
        await _readingListRepository.AddBookToReadingList(readingListId, bookId);

        // Возвращаем обновленный список
        var updatedList = await _readingListRepository.GetReadingListById(readingListId);
        return updatedList!;
    }

    public async Task<ReadingList> RemoveBookFromReadingList(Guid readingListId, Guid bookId)
    {
        var readingList = await _readingListRepository.GetReadingListById(readingListId);
        if (readingList == null)
            throw new KeyNotFoundException($"Reading list with ID {readingListId} not found");

        // Проверка, есть ли книга в списке
        if (!await _readingListRepository.IsBookInReadingList(readingListId, bookId))
            throw new InvalidOperationException("Book is not in the reading list");

        await _readingListRepository.RemoveBookFromReadingList(readingListId, bookId);

        // Возвращаем обновленный список
        var updatedList = await _readingListRepository.GetReadingListById(readingListId);
        return updatedList!;
    }

    public async Task<List<Book>> GetBooksInReadingList(Guid readingListId)
    {
        var readingList = await _readingListRepository.GetReadingListById(readingListId);
        if (readingList == null)
            throw new KeyNotFoundException($"Reading list with ID {readingListId} not found");

        var allBooks = await _bookRepository.GetBook();
        var bookIds = readingList.BookIds;

        return allBooks.Where(b => bookIds.Contains(b.Id)).ToList();
    }

    public async Task<bool> IsBookInReadingList(Guid readingListId, Guid bookId)
    {
        return await _readingListRepository.IsBookInReadingList(readingListId, bookId);
    }

    public async Task<int> GetReadingListBookCount(Guid readingListId)
    {
        var readingList = await _readingListRepository.GetReadingListById(readingListId);
        return readingList?.BookIds.Count ?? 0;
    }
}