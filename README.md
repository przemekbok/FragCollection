# FragCollection

A web application to manage your perfume collection, focused on decants and bottles. Users can create collections, add entries with details like volume and price per ml, and link to Fragrantica for additional information.

## Features

- User authentication and authorization
- Create and manage multiple collections of perfumes
- Add, update, and delete entries (bottles or decants)
- Calculate price per ml
- Track volume changes over time
- Automatic fetching of information from Fragrantica
- Share collections publicly
- Explore other users' public collections

## Technology Stack

- **Backend**: ASP.NET Core 8.0 Web API
- **Frontend**: React with TypeScript
- **Database**: SQL Server
- **Authentication**: Cookie-based authentication
- **ORM**: Entity Framework Core
- **Docker**: Containerization for easy deployment

## Project Structure

- **FragCollection**: Main API project with controllers
- **FragCollection.Core**: Domain models
- **FragCollection.IDAL**: Data access interfaces
- **FragCollection.DAL**: Data access implementations
- **FragCollection.Infrastructure**: Database context and infrastructure configuration
- **FragCollection.IServices**: Service interfaces
- **FragCollection.Services**: Business logic implementation
- **FragCollection.Web**: React client (separate repository)

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- Docker and Docker Compose (optional for containerized deployment)
- Visual Studio 2022 or Visual Studio Code
- SQL Server (or SQL Server Express)

### Running the Application

#### Using Docker

1. Clone the repository
2. Run `docker-compose up` in the root directory
3. Access the API at http://localhost:8080/swagger

#### Using Visual Studio

1. Clone the repository
2. Open the solution in Visual Studio
3. Update the connection string in `appsettings.json` if needed
4. Run the application

### Database Migrations

The application will automatically apply migrations in development mode. For production:

```bash
dotnet ef database update --project FragCollection.Infrastructure --startup-project FragCollection
```

## License

This project is licensed under the MIT License.
