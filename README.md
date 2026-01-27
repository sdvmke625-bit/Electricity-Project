# Electricity Bill System

A web-based application to manage and generate electricity bills with tiered rates, fine calculation, and duplicate validation.

## Features
- **Registration**: Register new consumers with strict validation (Name alphabets only, Phone exactly 10 digits).
- **Bill Generation**: Tiered calculation (0-50: 1.5, 50-100: 2.5, etc.), Minimum charge 25/-, Fine 150/-.
- **Admin & Employee Portals**: Separate views for managing users and generating bills.
- **Modular Design**: Separation of concerns (Frontend, Backend routes, Models).

## Prerequisites
- Node.js installed on your system.
- MongoDB installed and running.

## How to Run

1. **Clone/Download** the repository.
2. Open a terminal in the project root folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   node Backend/app.js
   ```
5. Open your browser and visit:
   `http://localhost:3000`

## Default Credentials
- **Admin**: `admin` / `admin123`
- **Employee**: `employee` / `emp123`

## Documentation
- [Module Specification](docs/ModuleSpecification.md)
- [Test Plan](docs/TestPlan.md)