# AGENTS.md

# Salon Queue Management System

> **Mission:** Build a production-quality Salon Queue Management System with a premium UI, scalable architecture, and clean code. The final application should be deployment-ready, fully responsive, and easy to extend.

---

# Read First

Before writing **any code**, read these files in the following order:

1. `docs/01-brief.md`
2. `docs/02-screens.md`
3. `docs/03-flows-rules.md`

These documents are the **single source of truth**.

Never invent functionality.

If documentation is ambiguous or contradictory, stop and explain the issue before implementing.

---

# Development Workflow

For every task:

1. Read the relevant documentation.
2. Explain your implementation plan briefly.
3. Implement **only** the requested build-plan step.
4. Do not modify unrelated screens or features.
5. Ensure the project builds successfully.
6. List:
   - Files changed
   - Files created
   - Commands executed
   - How to test
7. Stop and wait for the next instruction.

Never continue to the next build step automatically.

---

# Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- shadcn/ui
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Framer Motion
- Lucide React

## Backend

- FastAPI
- Python 3.12+
- SQLAlchemy 2.x
- Alembic
- Pydantic v2
- Uvicorn

## Database

- PostgreSQL

## Realtime

- FastAPI WebSockets

## Deployment

Frontend

- Vercel

Backend

- Railway (preferred)
- Render (acceptable alternative)

Database

- Supabase PostgreSQL (preferred)
- Neon PostgreSQL (acceptable alternative)

---

# Project Architecture

This is a **full-stack application**.

## Frontend Responsibilities

React is responsible only for:

- User Interface
- Navigation
- Forms
- API requests
- Client-side state
- Animations
- Responsive layouts

Business logic should **never** live inside React components.

---

## Backend Responsibilities

FastAPI owns all business logic including:

- Queue management
- Waiting time calculation
- Queue ordering
- Barber assignment
- Customer status transitions
- Queue rules
- Analytics
- Validation
- Authentication (if added later)
- Realtime updates

React should always consume backend APIs instead of recreating business rules.

---

## Database

Use PostgreSQL.

Access the database only through SQLAlchemy ORM.

Use Alembic for migrations.

Never write raw SQL unless absolutely necessary.

---

## Realtime Synchronization

The following screens must stay synchronized through WebSockets:

- Customer Status
- Reception Dashboard
- Barber View
- Waiting Area Display

Target synchronization time:

**Less than 5 seconds.**

---

# Folder Structure

Use a scalable feature-based architecture.

```
project/

frontend/
backend/

docs/

frontend/src/

components/
pages/
layouts/
hooks/
services/
store/
routes/
types/
utils/
constants/
assets/
lib/
i18n/

backend/

app/

api/
core/
models/
schemas/
services/
repositories/
db/
websocket/
utils/
```

Keep modules small and focused.

---

# UI Guidelines

The application should feel like premium salon software.

## Theme

Background

`#1F2937`

Primary Accent

`#D4A017`

Use:

- rounded corners
- generous spacing
- elegant typography
- subtle shadows
- minimal gradients

Avoid unnecessary visual clutter.

---

# Responsive Design

Every screen must work correctly on:

- Mobile
- Tablet
- Desktop
- TV Display

Design mobile-first.

Minimum touch target:

**44px**

---

# Accessibility

Always:

- use semantic HTML
- use keyboard navigation
- provide ARIA labels where appropriate
- maintain sufficient color contrast
- keep animations subtle

---

# Internationalization

Support:

- English
- Gujarati

Every visible string must come from translation files.

Never hardcode UI text.

---

# Code Quality

Always write:

- reusable components
- reusable hooks
- reusable utilities
- strongly typed code
- modular architecture

Avoid:

- duplicated logic
- large components
- deeply nested code
- magic numbers
- unnecessary abstraction

Prefer readability over cleverness.

---

# State Management

Use Zustand for UI state.

Use TanStack Query for server state.

React state should only contain:

- UI state
- Theme
- Language
- Cached API data

Business rules belong exclusively in FastAPI.

React must never calculate:

- waiting time
- queue order
- barber assignment
- statistics
- queue priority

Those values must come from backend APIs.

---

# API Rules

Use REST APIs for CRUD operations.

Use WebSockets for realtime updates.

Every request must use:

- Pydantic validation
- typed request models
- typed response models

Never expose SQLAlchemy models directly.

Business logic belongs inside service classes.

Controllers should remain thin.

---

# Queue Rules

Never invent queue behavior.

Implement queue rules only as described in:

`docs/03-flows-rules.md`

Queue logic must exist in exactly one location within the backend.

Avoid duplicated calculations.

---

# Routing

Required frontend routes:

```
/

Home

/join

Join Queue

/status/:id

Customer Status

/reception

Reception Dashboard

/barber/:name

Barber View

/display

Waiting Area TV

/admin

Owner Settings

404
```

---

# Dummy Data

Until backend APIs are connected, use realistic Indian sample data.

Barbers

- Ravi
- Amit
- Imran

Services

- Haircut
- Beard Trim
- Hair Spa
- Hair Coloring
- Facial
- Head Massage

Prices should be realistic.

---

# Performance

Prefer:

- lazy loading
- route splitting
- memoization where useful
- optimized rendering

Avoid premature optimization.

---

# Error Handling

Provide user-friendly error messages.

Never expose stack traces.

Handle:

- API failures
- validation errors
- websocket disconnects
- loading states
- empty states

---

# Logging

Backend:

Use structured logging.

Frontend:

Avoid excessive console logging.

Remove debug logs before completion.

---

# Testing Expectations

Each completed feature should be manually testable.

When finishing a task, explain:

- how to verify it
- expected behavior
- edge cases to test

---

# Git

Use Conventional Commits.

Examples:

```
feat(home): create landing page

feat(queue): implement join queue

feat(api): add customer endpoint

fix(status): correct wait calculation

refactor(layout): extract navigation

docs: update queue rules
```

Commit after every successful build step.

---

# Do Not Build

Unless explicitly requested, never add:

- Online payments
- Loyalty programs
- Future appointments
- SMS
- WhatsApp integration
- Email notifications
- Multi-branch support
- AI recommendations
- Social login

Anything listed under the **Don't Build** section in `docs/01-brief.md` must not be implemented.

---

# Definition of Done

A task is complete only if:

- Project builds successfully
- No TypeScript errors
- No Python errors
- No linting errors
- Responsive on all target devices
- Matches project documentation
- Existing functionality remains intact
- Translation support is preserved
- No broken routes
- Code is modular and reusable

---

# Response Format

After every completed task, provide:

## Summary

A short explanation of what was implemented.

## Files Changed

List every modified file.

## Files Created

List every new file.

## Commands Executed

Include all commands that were run.

## Testing

Explain how to verify the feature.

## Remaining Work

Describe what remains for the next build-plan step.

Then stop.

Do not continue automatically.

---

# Golden Rules

- Documentation is the source of truth.
- Build only the requested scope.
- Never guess missing requirements.
- Prefer simple, maintainable solutions.
- Keep UI polished and responsive.
- Keep backend logic centralized.
- Keep React focused on presentation.
- Explain major architectural decisions before implementing them.
- Never sacrifice code quality for speed.