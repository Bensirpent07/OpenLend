# OpenLend

OpenLend is an open-source equipment lending and reservation platform for organizations that manage shared physical assets.

It is intended for use cases such as tool libraries, makerspaces, schools, nonprofits, clubs, community organizations, and other groups that lend equipment to members.

The project is being built as a long-term distributed application with a focus on maintainable architecture, event-driven communication, and strong automated testing.

## Features

Planned functionality includes:

- Equipment catalog and inventory management
- Reservations and availability scheduling
- Waitlists
- Equipment checkout and return
- Overdue tracking
- Asset condition and maintenance tracking
- User and organization management
- Notifications and reminders
- Audit history
- Reporting and utilization analytics

## Tech Stack

### Backend

- .NET 10
- ASP.NET Core
- Entity Framework Core
- MySQL
- Redis

### Frontend

- Angular
- PrimeNG
- NgRx

### Testing

- xUnit
- Testcontainers
- Vitest
- Playwright

### Infrastructure

- Docker
- Docker Compose
- OpenTelemetry
- GitHub Actions
- AWS or DigitalOcean

## Architecture

OpenLend is being developed using a microservice-oriented architecture with independently owned service boundaries.

The initial implementation includes a Catalog service structured into:

```text
OpenLend.Catalog.Api
OpenLend.Catalog.Application
OpenLend.Catalog.Domain
OpenLend.Catalog.Infrastructure
```

Additional services will be introduced as the application grows.

## Repository Structure

```text
apps/
services/
tests/
docs/
deploy/
```

## Local Development

### Prerequisites

- .NET 10 SDK
- Node.js
- Docker Desktop
- Git

### Start Infrastructure

Create a local `.env` file using `.env.example` as a reference.

Then run:

```bash
docker compose up -d
```

Additional setup instructions will be added as the application develops.

## Project Status

OpenLend is currently in early development.

Current work includes:

- Initial Catalog service architecture
- MySQL persistence
- Entity Framework Core migrations
- Docker-based local development
- Unit and integration test projects

The Angular frontend and additional services are still under development.

## Documentation

More detailed architecture and implementation documentation will be added under `/docs` and may later be expanded into a project wiki.

## License

OpenLend is licensed under the MIT License.