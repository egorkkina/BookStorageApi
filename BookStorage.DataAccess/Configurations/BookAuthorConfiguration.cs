using BookStorage.DataAccess.Entites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStorage.DataAccess.Configurations;

public class BookAuthorConfiguration : IEntityTypeConfiguration<BookAuthorEntity>
{
    public void Configure(EntityTypeBuilder<BookAuthorEntity> builder)
    {
        builder.HasKey(ba => new { ba.BookId, ba.AuthorId });
    }
}