using BookStorage.DataAccess.Entites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BookStore.Core.Models;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace BookStorage.DataAccess.Configurations;

public class BookConfigurations : IEntityTypeConfiguration<BookEntity>
{
    public void Configure(EntityTypeBuilder<BookEntity> builder)
    {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Title)
            .HasMaxLength(Book.MAX_LENGTH_TITLE)
            .IsRequired();
        
        builder.Property(x => x.Authors)
            .HasMaxLength(1000);
        
        builder
            .HasMany(b => b.BookAuthors)
            .WithOne(ba => ba.Book)
            .HasForeignKey(ba => ba.BookId);
        
        builder.Property(x => x.Description)
            .HasMaxLength(Book.MAX_LENGTH_DESCRIPTION);
        
        builder.Property(x => x.Price)
            .HasColumnType("decimal(10,2)");
    }
}