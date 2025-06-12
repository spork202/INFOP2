# Stage 1: Base image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app

# Create directory for Data Protection keys with correct permissions
RUN mkdir -p /app/keys && chown $APP_UID:$APP_UID /app/keys && chmod 700 /app/keys
VOLUME /app/keys

# Expose ports (8080 for HTTP, 8081 for HTTPS if needed)
EXPOSE 8080
EXPOSE 8081

# Environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# Stage 2: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["INFOP2/INFOP2.csproj", "INFOP2/"]
RUN dotnet restore "INFOP2/INFOP2.csproj"
COPY . .
WORKDIR "/src/INFOP2"
RUN dotnet build "./INFOP2.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Stage 3: Publish
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./INFOP2.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Stage 4: Final
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Ensure the keys directory exists and has proper permissions
RUN mkdir -p /app/keys && chown $APP_UID:$APP_UID /app/keys && chmod 700 /app/keys

ENTRYPOINT ["dotnet", "INFOP2.dll"]