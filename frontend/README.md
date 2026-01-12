# Frontend - Product Management System

The frontend application for the Product Management System, built with Next.js 15, TypeScript, and modern React patterns.

## 🚀 Features

- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Responsive Design**: Mobile-first design with sticky columns for data tables
- **Dark Mode**: Theme support with light/dark mode toggle
- **Type-Safe API**: End-to-end type safety with tRPC React Query
- **Advanced Data Tables**: TanStack Table with filtering, sorting, and pagination
- **Form Management**: React Hook Form with Zod validation
- **State Management**: Zustand for global state
- **Role-Based Access Control**: Permission-based UI rendering
- **Bulk Operations**: Bulk actions for products and permissions
- **Image Upload**: Product image management
- **Real-time Search**: Server-driven filtering with real-time search capabilities
- **Charts & Analytics**: Recharts for data visualization

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: Shadcn UI with Radix UI
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Tables**: TanStack Table
- **Forms**: React Hook Form + Zod
- **API Client**: tRPC React Query
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **Backend API** running (see backend README)

> **Note**: This project is optimized for Bun runtime but works with Node.js. All commands use npm for compatibility.

## 🚀 Getting Started

### Install Dependencies

```bash
cd frontend
npm install
```

### Environment Configuration

Copy the `.env.example` file to create your `.env` file:

```bash
cp .env.example .env
```

Then edit the `.env` file with your configuration:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Start the Frontend Development Server

```bash
npm run dev
```

The frontend application will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── app/                  # Next.js app router pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Dashboard/home page
│   ├── login/            # Login page
│   ├── products/         # Products page
│   ├── users/            # Users management page
│   ├── permissions/      # Permissions management page
│   └── roles/            # Roles management page
├── components/           # React components
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── content.tsx
│   │   ├── deals-table.tsx
│   │   ├── header.tsx
│   │   ├── lead-sources-chart.tsx
│   │   ├── revenue-flow-chart.tsx
│   │   ├── shell.tsx
│   │   ├── sidebar.tsx
│   │   ├── stats-cards.tsx
│   │   └── welcome-section.tsx
│   ├── data-table/       # Reusable data table components
│   │   ├── data-table.tsx
│   │   └── data-table-pagination.tsx
│   ├── permissions/      # Permission management components
│   │   ├── bulk-assign-modal.tsx
│   │   ├── permissions-filters.tsx
│   │   └── permissions-table.tsx
│   ├── products/         # Product management components
│   │   ├── bulk-preview-modal.tsx
│   │   ├── delete-confirmation.tsx
│   │   ├── image-upload.tsx
│   │   └── product-filters.tsx
│   ├── users/            # User management components
│   │   ├── users-filters.tsx
│   │   └── users-table.tsx
│   ├── providers/        # React context providers
│   │   ├── auth-provider.tsx
│   │   ├── theme-provider.tsx
│   │   ├── trpc-provider.tsx
│   │   └── index.tsx
│   ├── ui/               # Reusable UI components (Radix UI based)
│   │   ├── alert-dialog.tsx
│   │   ├── auth-loading.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command-bar.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── kbd.tsx
│   │   ├── label.tsx
│   │   ├── password-input.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── sonner.tsx
│   │   ├── table.tsx
│   │   └── tooltip.tsx
│   └── theme-toggle.tsx  # Theme switcher component
├── features/             # Feature modules
│   ├── login/            # Login feature
│   │   ├── components/
│   │   └── schema.ts
│   ├── products/         # Products feature
│   │   ├── components/
│   │   └── schema.ts
│   └── users/            # Users feature
│       ├── components/
│       └── schema.ts
├── hooks/                # Custom React hooks
│   ├── use-focus-preservation.ts
│   ├── use-mobile.ts
│   └── use-product-filter-options.ts
├── lib/                  # Utilities and configurations
│   ├── permissions.ts    # Permission utilities
│   ├── trpc/             # tRPC client setup
│   │   ├── client.ts
│   │   └── types.d.ts
│   ├── utils.ts          # Utility functions
│   └── validation/       # Validation utilities
│       └── password.ts
├── store/                # Zustand stores
│   ├── authStore.ts      # Authentication store
│   └── dashboard-store.ts # Dashboard state store
├── mock-data/            # Mock data for development
│   ├── deals.ts
│   └── stats.ts
├── public/               # Static assets
└── package.json
```

## 🧪 Available Scripts

### Development

```bash
npm run dev              # Start Next.js development server
```

### Build & Production

```bash
npm run build            # Build for production
npm run start            # Start production server
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

## 🎨 UI Components

The frontend uses a custom component library built on Radix UI:

- **Data Tables**: Sticky columns, filtering, pagination, sorting
- **Forms**: React Hook Form integration with Zod validation
- **Modals**: Dialog components for create/edit operations
- **Command Bar**: Keyboard shortcuts for common actions
- **Theme Toggle**: Light/dark mode support
- **Charts**: Recharts integration for data visualization
- **Sidebar**: Responsive navigation sidebar
- **Toast Notifications**: Sonner for user feedback

### Component Patterns

- **Feature-based organization**: Components grouped by feature
- **Reusable UI primitives**: Base components in `components/ui/`
- **Type-safe forms**: React Hook Form with Zod schemas
- **Accessible components**: Built on Radix UI for accessibility

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Login**: User credentials sent to backend, JWT tokens received
2. **Token Storage**: Access token in memory, refresh token in HttpOnly cookie
3. **Auto Refresh**: Access token automatically refreshed on expiry
4. **Protected Routes**: Route protection based on authentication state

### Permission-Based UI

The UI conditionally renders features based on user permissions:

- **Permission checks**: `lib/permissions.ts` utilities
- **Conditional rendering**: Components check permissions before rendering
- **Role-based navigation**: Sidebar items filtered by permissions

## 📡 API Integration

### tRPC Client Setup

The frontend uses tRPC React Query for type-safe API calls:

- **Provider**: `components/providers/trpc-provider.tsx`
- **Client**: `lib/trpc/client.ts`
- **Type Safety**: Full end-to-end type safety from backend to frontend

### API Usage Example

```typescript
// In a component
const { data, isLoading } = trpc.product.list.useQuery({
  page: 1,
  limit: 10,
  filters: { search: 'query' }
});
```

## 🎨 Styling

### Tailwind CSS

- **Configuration**: `tailwind.config.js`
- **Custom colors**: Theme-aware color system
- **Responsive design**: Mobile-first breakpoints
- **Dark mode**: Automatic dark mode support

### Theme System

- **Theme Provider**: `components/providers/theme-provider.tsx`
- **Theme Toggle**: `components/theme-toggle.tsx`
- **CSS Variables**: Theme colors defined as CSS variables

## 🚢 Deployment

### Production Build

1. Set `NEXT_PUBLIC_API_URL` to your production backend URL in `.env`
2. Build the application: `npm run build`
3. Start the server: `npm run start`

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your production backend URL
3. Deploy automatically on push

### Netlify Deployment

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Configure build command: `npm run build`
4. Set publish directory: `.next`

### Environment Variables

Required environment variables:

- `NEXT_PUBLIC_API_URL`: Backend API URL (must be public for client-side access)

## 🐛 Troubleshooting

### API Connection Issues

- **Verify `NEXT_PUBLIC_API_URL`** in `.env` matches backend URL
- **Check backend is running** and accessible
- **Verify CORS settings** in backend allow frontend origin

### CORS Errors

- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check browser console for specific CORS error messages
- Verify backend CORS middleware configuration

### Build Errors

- **Clear `.next` folder** and rebuild: `rm -rf .next && npm run build`
- **Check TypeScript errors**: Run `npm run typecheck` if available
- **Verify dependencies**: Run `npm install` to ensure all dependencies are installed

### Theme Issues

- Clear browser cache if theme toggle not working
- Check `theme-provider.tsx` configuration
- Verify CSS variables are properly defined

### Type Errors

- Ensure backend types are up to date
- Run `npm run build` to see all TypeScript errors
- Check tRPC client configuration

## 📝 Code Style

- **ESLint**: Configured with Next.js and TypeScript rules
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Strict mode enabled
- **Conventions**: Follow existing code patterns and naming conventions
- **Component Structure**: Functional components with hooks

## 🧪 Development Tips

### Hot Reload

Next.js provides fast refresh for instant updates during development.

### Type Safety

- All API calls are type-safe through tRPC
- Form validation uses Zod schemas
- Component props are fully typed

### Performance

- Components are optimized with React best practices
- Images are optimized with Next.js Image component
- Code splitting is handled automatically by Next.js

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hook Form](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [TanStack Table](https://tanstack.com/table)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC Documentation](https://trpc.io)

---

**Note**: For Bun users, you can replace `npm` commands with `bun` for faster execution. The project is fully compatible with both Node.js and Bun runtimes.
