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

    public void AddBooks(IEnumerable<Guid> bookIds)
    {
        foreach (var id in bookIds)
        {
            if (!_bookIds.Contains(id))
                _bookIds.Add(id);
        }
    }
}