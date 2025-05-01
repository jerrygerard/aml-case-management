# AML Case Management System

A comprehensive case management system for Anti-Money Laundering (AML) investigations.

## Features

- Case creation and management
- Status tracking and updates
- Activity timeline
- File attachments
- Comments and notes
- User management
- Role-based access control

## Tech Stack

- Frontend: React, TypeScript, Material-UI
- Backend: Node.js, Express
- Database: PostgreSQL
- ORM: Sequelize

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aml-case-management.git
cd aml-case-management
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up the database:
```bash
# Create a PostgreSQL database
createdb aml_case_management

# Run migrations
cd server
npx sequelize-cli db:migrate
```

4. Configure environment variables:
Create `.env` files in both server and client directories with the necessary configuration.

5. Start the development servers:
```bash
# Start the backend server
cd server
npm run dev

# Start the frontend server
cd client
npm start
```

## Project Structure

```
aml-case-management/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # Source files
│       ├── api/           # API client
│       ├── components/    # React components
│       └── pages/         # Page components
└── server/                # Backend Node.js application
    ├── src/               # Source files
    │   ├── controllers/   # Route controllers
    │   ├── models/        # Database models
    │   ├── routes/        # API routes
    │   └── middleware/    # Express middleware
    └── migrations/        # Database migrations
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 