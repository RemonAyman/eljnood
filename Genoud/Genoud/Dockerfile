# Multi-stage Dockerfile for ASP.NET Core Web API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Genoud.csproj", "./"]
RUN dotnet restore "Genoud.csproj"
COPY . .
RUN dotnet publish "Genoud.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV PORT=5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "Genoud.dll"]
