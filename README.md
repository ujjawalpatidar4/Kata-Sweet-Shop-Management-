# Sweet Shop Management System

A full-stack application for managing a sweet shop with user authentication, inventory management, and purchase features.

## Tech Stack

### Backend
- Node.js with Express
- MongoDB (Database)
- JWT (Authentication)
- Jest & Supertest (Testing)

### Frontend
- React with Vite
- React Router (Routing)
- Axios (API calls)
- TailwindCSS (Styling)

## Features

- User registration and authentication
- Browse and search sweets
- Purchase sweets (with inventory tracking)
- Admin features: Add, update, delete, and restock sweets

## Development Approach

This project follows Test-Driven Development (TDD) principles with a clear "Red-Green-Refactor" pattern.

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB installed and running
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd sweet-shop
```

2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URL and JWT secret
npm test
npm run dev
```

3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Sweets (Protected)
- `POST /api/sweets` - Add a new sweet
- `GET /api/sweets` - Get all sweets
- `GET /api/sweets/search` - Search sweets
- `PUT /api/sweets/:id` - Update sweet
- `DELETE /api/sweets/:id` - Delete sweet (Admin only)

### Inventory (Protected)
- `POST /api/sweets/:id/purchase` - Purchase sweet
- `POST /api/sweets/:id/restock` - Restock sweet (Admin only)

## Testing

```bash
cd backend
npm test
npm run test:coverage
```

## Application Screenshots

### Login Page
![Dashboard](./Sceenshots/Screenshot%20(191).png)

### Dashboard with Search and Image Slider
![Dashboard](./Sceenshots/Screenshot%20(192).png)

## My AI Usage

### AI Tools Used
- **GitHub Copilot** - Primary AI assistant for code generation, UI/UX improvements, and styling.

### How AI Was Used

#### 1. **UI/UX Theme Development**
#### 2. **Search Button Visualization**
#### 3. **Color and Theme Refinement**
#### 4. **Responsive Design**

### Impact on Workflow

**Positive:**
- **Speed**
- **Learning**

**Challenges:**
- **Over-reliance**
- **CSS Processing Issues**

## License

MIT
