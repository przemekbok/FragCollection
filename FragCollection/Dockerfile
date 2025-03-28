FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["FragCollection.sln", "./"]
COPY ["FragCollection/FragCollection.csproj", "FragCollection/"]
COPY ["FragCollection.Core/FragCollection.Core.csproj", "FragCollection.Core/"]
COPY ["FragCollection.Interfaces/FragCollection.Interfaces.csproj", "FragCollection.Interfaces/"]
COPY ["FragCollection.Infrastructure/FragCollection.Infrastructure.csproj", "FragCollection.Infrastructure/"]
COPY ["FragCollection.Services/FragCollection.Services.csproj", "FragCollection.Services/"]
RUN dotnet restore
COPY . .
WORKDIR "/src/FragCollection"
RUN dotnet build "./FragCollection.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./FragCollection.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FragCollection.dll"]