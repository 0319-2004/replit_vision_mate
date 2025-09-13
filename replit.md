# DataFlow Pro - Enterprise Data Scraping Platform

## Overview

DataFlow Pro is an enterprise-grade data scraping and extraction platform designed for technical teams. The application provides a comprehensive web-based interface for creating, managing, and monitoring data scraping jobs from various sources including websites and social media platforms. The platform features real-time progress tracking, multiple export formats, API integration, and team collaboration capabilities.

The system is built as a full-stack web application with a React frontend and Express backend, utilizing modern web technologies to deliver a professional, scalable data extraction solution.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui components for consistent, accessible design
- **Styling**: Tailwind CSS with custom design system supporting dark/light themes
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful API endpoints with structured error handling
- **Session Management**: Express sessions with PostgreSQL storage for scalable session handling
- **Authentication**: Replit Auth integration with OpenID Connect for secure user management

### Database Layer
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Design**: Relational structure supporting users, projects, participations, progress tracking, and comments
- **Connection Management**: Connection pooling with @neondatabase/serverless for optimal performance

### Authentication & Authorization
- **Authentication Provider**: Replit Auth with OIDC (OpenID Connect) protocol
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: HTTP-only cookies, CSRF protection, and secure session configuration
- **User Management**: Automatic user provisioning and profile management

### Design System
- **Theme Support**: Comprehensive dark/light mode with CSS custom properties
- **Component Library**: Custom component system built on Radix UI primitives
- **Typography**: Inter font for UI, JetBrains Mono for code/data display
- **Color Palette**: Professional blue-based theme with semantic color tokens
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Development Tooling
- **Hot Reload**: Vite HMR for instant development feedback
- **Type Checking**: Strict TypeScript configuration across frontend and backend
- **Path Aliases**: Organized import structure with @ aliases for clean code organization
- **Error Handling**: Comprehensive error boundaries and API error management

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Authentication Services
- **Replit Auth**: OIDC-based authentication provider for secure user management
- **OpenID Client**: Standards-compliant authentication flow implementation

### UI Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Lucide React**: Modern icon library for consistent iconography
- **TanStack React Query**: Server state management and caching solution

### Development & Build Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **PostCSS**: CSS processing with Tailwind CSS integration
- **ESBuild**: Fast JavaScript bundler for production server builds

### Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **clsx**: Conditional CSS class name utility
- **memoizee**: Function memoization for performance optimization
- **wouter**: Lightweight React router for client-side navigation

### Type Safety & Validation
- **Zod**: Runtime type validation and schema parsing
- **drizzle-zod**: Integration between Drizzle ORM and Zod for schema validation
- **React Hook Form**: Form management with validation integration