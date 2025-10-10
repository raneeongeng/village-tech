# Village Management Platform (VMP) Constitution

## Core Principles

### I. Technology Stack & Architecture
**Next.js 14+ App Router with TypeScript and Supabase Backend**
- Frontend: Next.js 14+ with App Router, React 18+, TypeScript for type safety
- Backend: Supabase for auth, database, storage, and edge functions
- Modular code organization by domain: tenant, user, security, household, shared
- Multi-tenant architecture with isolated schemas and strict data separation

### II. Development Standards & Tooling
**TailwindCSS, React Hook Form, and Docker-First Development**
- Design System: TailwindCSS for consistent styling and component architecture
- Forms: React Hook Form for all form handling and validation
- Environment: Docker containers for consistent local and deployment environments
- Configuration: Environment variables (.env) for Supabase credentials and secrets
- Version Control: Clean git history with conventional commit messages

### III. User Experience & Design System
**Modern, Simple, Elegant Interface with Defined Color Palette**
- Visual Philosophy: Calm, easy navigation with high readability
- Color Palette: Primary #22574A, Secondary #E8DCCA, Accent #D96E49, Background #FCFBF9, Text #555555
- Typography: Inter (body text), Poppins (headings)
- UI Elements: Soft shadows, rounded corners, 8px grid spacing system

### IV. MVP Feature Priorities
**Multi-Tenant Village Management with Core Operations**
Focus areas in delivery order:
1. Tenant creation and configuration (multi-village management)
2. Household & user management with role assignments
3. Entry/exit workflows (stickers, guests, deliveries)
4. Sticker and permit management systems
5. Fee computation and payment tracking
6. Construction requests and approval workflows
7. Incident reporting and live response coordination
8. Rules, announcements, and resident communication

### V. Security & Role-Based Access Control
**Comprehensive RBAC with Tenant Data Isolation**
User Roles: Superadmin, Admin-Head, Admin-Officer, Household-Head, Household-Member, Beneficial-User, Security-Head, Security-Officer
- Tenant boundaries: Absolute data separation between villages/communities
- Authentication: Route-level and API-level permission validation
- Input validation: Comprehensive sanitization for all user inputs
- Audit logging: Track all administrative actions and data modifications

## Quality Assurance Standards

### Code Quality Requirements
- **Component Reusability**: Modular, composable components with clear APIs
- **Code Reviews**: Mandatory peer review for all code changes
- **Testing Coverage**: Jest/Vitest for core business logic testing
- **Type Safety**: Full TypeScript implementation with strict type checking

### Development Tools
- **Formatting**: Prettier for consistent code style across the project
- **Linting**: ESLint with TypeScript rules for code quality enforcement
- **Pre-commit Hooks**: Automated formatting and linting validation
- **Documentation**: JSDoc for complex functions, comprehensive API docs

## Collaboration Guidelines

### Development Workflow
- **Feature Development**: Branch-based development with pull request reviews
- **Iterative Delivery**: MVP-first approach with incremental feature enhancement
- **Performance Monitoring**: Regular performance audits and optimization
- **Dependency Management**: Regular updates and security patch maintenance

### Documentation Standards
- **Code Documentation**: Clear inline comments for complex business logic
- **User Guides**: Comprehensive documentation for tenant administrators
- **API Documentation**: Complete endpoint documentation with examples
- **Changelog Management**: Detailed version tracking and release notes

## Governance

### Constitutional Authority
This constitution supersedes all other development practices and guidelines. All code reviews, feature implementations, and architectural decisions must verify compliance with these principles.

### Amendment Process
Constitution amendments require:
1. Documentation of proposed changes with justification
2. Team review and approval process
3. Migration plan for existing code if applicable
4. Updated version tracking with ratification date

### Compliance Requirements
- All pull requests must demonstrate adherence to architectural principles
- Security and multi-tenancy requirements are non-negotiable
- Design system compliance required for all UI components
- Role-based access control must be implemented for all new features

**Version**: 1.0.0 | **Ratified**: 2025-10-09 | **Last Amended**: 2025-10-09