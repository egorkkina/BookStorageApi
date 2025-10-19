using BookStorage.DataAccess.Entites;
using BookStore.Core.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookStorage.DataAccess.Configurations;

public class AuthorConfiguration : IEntityTypeConfiguration<AuthorEntity>
{
    public void Configure(EntityTypeBuilder<AuthorEntity> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Name)
            .HasMaxLength(Author.MAX_LENGTH_NAME)
            .IsRequired();

        builder
            .HasMany(a => a.BookAuthors)
            .WithOne(ba => ba.Author)
            .HasForeignKey(ba => ba.AuthorId);
    }
}