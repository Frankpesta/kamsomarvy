# Kamsomarvy Real Estate Website

A modern, feature-rich real estate listing website built with Next.js 16+, TypeScript, Tailwind CSS, shadcn/ui, GSAP animations, and Convex backend.

## Features

- 🏠 **Property Listings**: Browse properties with filters (For Sale/For Rent, Property Type)
- 🖼️ **Image Slideshow**: Beautiful image galleries on property detail pages
- 💬 **WhatsApp Integration**: Direct enquiry via WhatsApp with property details
- 👥 **Representatives**: Showcase estate agents on About and Contact pages
- 🔐 **Admin Dashboard**: Full CRUD operations for properties, representatives, and site content
- 📊 **Statistics**: Dashboard with property statistics broken down by type and category
- ✨ **Modern UI**: Smooth GSAP animations and elegant design
- 🔒 **Admin Authentication**: Secure admin login with password reset functionality

## Tech Stack

- **Frontend**: Next.js 16+, React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animations**: GSAP with ScrollTrigger
- **Backend**: Convex (database, file storage, authentication)
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Convex account (sign up at [convex.dev](https://convex.dev))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd realestate
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev
```
This will:
- Create a new Convex project (if needed)
- Generate the deployment URL
- Set up the database schema

4. Create a `.env.local` file:
```bash
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
RESEND_API_KEY=your_resend_api_key  # Optional, for email functionality
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Admin Setup

1. Navigate to `/admin/signup` to create the first admin account
2. After creating the account, you'll be redirected to login
3. Log in with your credentials to access the admin dashboard

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/              # Admin pages
│   │   ├── login/         # Admin login
│   │   ├── signup/        # First admin signup
│   │   ├── properties/    # Property management
│   │   ├── representatives/ # Representative management
│   │   ├── admins/        # Admin management (super admin only)
│   │   └── content/       # Site content management
│   ├── about/              # About page
│   ├── contact/            # Contact page
│   ├── properties/         # Property listing and detail pages
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── navbar.tsx         # Navigation bar
│   ├── footer.tsx          # Footer component
│   └── property-card.tsx   # Property card component
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── auth.ts            # Authentication functions
│   ├── properties.ts     # Property CRUD operations
│   ├── representatives.ts # Representative CRUD operations
│   ├── admins.ts          # Admin management
│   ├── siteContent.ts     # Site content management
│   └── files.ts           # File storage operations
└── lib/                   # Utilities
    ├── convex-provider.tsx # Convex React provider
    ├── store.ts           # Zustand store
    └── file-upload.ts     # File upload utilities
```

## Admin Features

### Dashboard
- View property statistics (total, by category, by type)
- Quick access to all management pages

### Property Management
- Add, edit, delete properties
- Upload multiple images per property
- Set featured properties (Hot Sales section)
- Filter and search properties

### Representative Management
- Add, edit, delete representatives
- Upload photos
- Set display order

### Site Content Management
- Edit hero section text
- Update Hot Sales section title
- Edit About page content

### Admin Management (Super Admin Only)
- Invite new admins
- Remove admins
- Set admin roles

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
RESEND_API_KEY=your_resend_api_key  # Optional
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Convex Deployment

Convex automatically deploys when you run `npx convex dev`. For production:

```bash
npx convex deploy --prod
```

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
