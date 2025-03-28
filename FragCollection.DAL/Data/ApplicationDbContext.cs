using FragCollection.Core.Models;
using Microsoft.EntityFrameworkCore;

namespace FragCollection.DAL.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<PerfumeEntry> PerfumeEntries { get; set; }
        public DbSet<PerfumeInfo> PerfumeInfos { get; set; }
        public DbSet<PerfumeNote> PerfumeNotes { get; set; }
        
        // Collection is deprecated but kept for backward compatibility
        public DbSet<Collection> Collections { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.CollectionName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.CollectionDescription).HasMaxLength(500);
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Collection is deprecated but kept for backward compatibility
            modelBuilder.Entity<Collection>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                
                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // PerfumeEntry configuration - updated to reference User directly
            modelBuilder.Entity<PerfumeEntry>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Brand).HasMaxLength(100);
                entity.Property(e => e.Volume).HasPrecision(10, 2);
                entity.Property(e => e.PricePerMl).HasPrecision(10, 2);
                entity.Property(e => e.FragranticaUrl).HasMaxLength(500);
                
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Entries)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(e => e.PerfumeInfo)
                      .WithMany(p => p.Entries)
                      .HasForeignKey(e => e.PerfumeInfoId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // PerfumeInfo configuration
            modelBuilder.Entity<PerfumeInfo>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Brand).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(2000);
                entity.Property(e => e.ImageUrl).HasMaxLength(500);
                entity.Property(e => e.FragranticaUrl).IsRequired().HasMaxLength(500);
                
                entity.HasIndex(e => e.FragranticaUrl).IsUnique();
            });

            // PerfumeNote configuration
            modelBuilder.Entity<PerfumeNote>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                
                entity.HasOne(e => e.PerfumeInfo)
                      .WithMany(p => p.Notes)
                      .HasForeignKey(e => e.PerfumeInfoId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}