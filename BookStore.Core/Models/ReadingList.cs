namespace BookStore.Core.Models;

public class ReadingList
{
    public Guid Id { get; }
    public Guid UserId { get; }
    public string ReadingListName { get; }
    public string ReadingListDescription { get; }
    public bool IsPublic { get; }
    
    private readonly List<Guid> _bookIds = new();
    public IReadOnlyList<Guid> BookIds => _bookIds.AsReadOnly();
    
    private ReadingList(Guid id, string name, string description, Guid userId, bool isPublic)
    {
        Id = id;
        ReadingListName = name;
        ReadingListDescription = description;
        UserId = userId;
        IsPublic = isPublic;
    }

    public static (ReadingList readingList, string error) Create(string name, Guid userId,
        string description = "", bool isPublic = true)
    {
        var error = string.Empty;
        
        var list = new ReadingList(Guid.NewGuid(), name.Trim(), description?.Trim() ?? "", userId, isPublic);
        
        return (list, error);
    }
    
    public void AddBook(Guid bookId)
    {
        if (_bookIds.Contains(bookId))
            throw new InvalidOperationException("This book is already on my reading list.");
        
        _bookIds.Add(bookId);
    }

    public void AddBooks(IEnumerable<Guid> bookIds)
    {
        foreach (var id in bookIds)
        {
            if (!_bookIds.Contains(id))
                _bookIds.Add(id);
        }
    }
    
    public void RemoveBook(Guid bookId)
    {
        if (!_bookIds.Remove(bookId))
            throw new KeyNotFoundException("The book was not found in the reading list.");
    }

    public bool ContainsBook(Guid bookId) => _bookIds.Contains(bookId);

}