using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FragCollection.DAL.Migrations
{
    /// <inheritdoc />
    public partial class SingleCollectionPerUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add new fields to User table
            migrationBuilder.AddColumn<string>(
                name: "CollectionName",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "My Perfume Collection");

            migrationBuilder.AddColumn<string>(
                name: "CollectionDescription",
                table: "Users",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            // Populate collection info for each user from their first collection
            migrationBuilder.Sql(@"
                UPDATE Users
                SET CollectionName = c.Name, 
                    CollectionDescription = c.Description
                FROM Users u
                INNER JOIN Collections c ON u.Id = c.UserId
                WHERE c.Id IN (
                    SELECT TOP 1 c2.Id 
                    FROM Collections c2 
                    WHERE c2.UserId = u.Id 
                    ORDER BY c2.CreatedAt ASC
                )
            ");

            // Add UserId column to PerfumeEntry
            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "PerfumeEntries",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            // Set UserId in PerfumeEntry based on CollectionId
            migrationBuilder.Sql(@"
                UPDATE PerfumeEntries
                SET UserId = c.UserId
                FROM PerfumeEntries pe
                INNER JOIN Collections c ON pe.CollectionId = c.Id
            ");

            // Create index on UserId in PerfumeEntries
            migrationBuilder.CreateIndex(
                name: "IX_PerfumeEntries_UserId",
                table: "PerfumeEntries",
                column: "UserId");

            // Add foreign key from PerfumeEntry to User
            migrationBuilder.AddForeignKey(
                name: "FK_PerfumeEntries_Users_UserId",
                table: "PerfumeEntries",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove foreign key
            migrationBuilder.DropForeignKey(
                name: "FK_PerfumeEntries_Users_UserId",
                table: "PerfumeEntries");

            // Remove index
            migrationBuilder.DropIndex(
                name: "IX_PerfumeEntries_UserId",
                table: "PerfumeEntries");

            // Remove UserId column from PerfumeEntry
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "PerfumeEntries");

            // Remove collection fields from User
            migrationBuilder.DropColumn(
                name: "CollectionName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CollectionDescription",
                table: "Users");
        }
    }
}