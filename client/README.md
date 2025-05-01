# AML Case Management System - Client

This is the frontend application for the AML Case Management System, built with React, TypeScript, and Material-UI.

## Features

- Modern, responsive UI with Material-UI components
- User authentication and authorization
- Case management with filtering and pagination
- Real-time updates with React Query
- Form validation with React Hook Form
- Type-safe development with TypeScript

## Prerequisites

- Node.js (v14 or later)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the client directory:
   ```bash
   cd client
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Configuration

Create a `.env` file in the client directory with the following variables:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## Development

To start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build files will be created in the `build` directory.

## Testing

To run the test suite:

```bash
npm test
# or
yarn test
```

## Linting

To run ESLint:

```bash
npm run lint
# or
yarn lint
```

## Formatting

To format code with Prettier:

```bash
npm run format
# or
yarn format
```

## Project Structure

```
client/
├── public/              # Static files
├── src/
│   ├── api/            # API client and endpoints
│   ├── components/     # Reusable components
│   ├── layouts/        # Layout components
│   ├── pages/          # Page components
│   ├── store/          # State management
│   ├── theme/          # Material-UI theme
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   └── index.tsx       # Application entry point
├── .eslintrc.json      # ESLint configuration
├── .prettierrc         # Prettier configuration
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 