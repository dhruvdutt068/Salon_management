# Salon Queue Management System

## Project Brief & Scope

---

# Project Overview

The Salon Queue Management System is a modern digital queue management platform that allows customers to join a salon queue remotely, monitor their waiting status in real time, and receive notifications when it is their turn. The system also provides staff with efficient tools to manage queues, assign customers to barbers, and monitor daily operations.

The primary goal is to reduce physical waiting, eliminate confusion about queue order, and improve the overall customer experience while increasing operational efficiency for salon staff.

This project is designed as a full-stack web application with a React frontend and a FastAPI backend, providing real-time synchronization across all connected devices.

---

# Problem Statement

Traditional salons often rely on handwritten waiting lists or verbal communication to manage customers. During busy hours, customers may wait for long periods without knowing their estimated waiting time or queue position.

Common problems include:

- Customers leaving because they do not know how long they must wait.
- Staff manually managing queues, leading to mistakes.
- Arguments regarding queue order.
- Difficulty handling multiple barbers with different customer preferences.
- No centralized view of salon operations.

The proposed system solves these issues through a transparent and real-time digital queue.

---

# Objectives

The application aims to:

- Reduce customer waiting frustration.
- Improve salon workflow.
- Provide transparent queue visibility.
- Automatically calculate waiting times.
- Synchronize information across customer, receptionist, barber, and display screens.
- Improve customer satisfaction.
- Minimize manual queue management.

---

# Target Users

## Customer

Customers can:

- Join the queue remotely.
- Select one or multiple services.
- Choose a preferred barber or "Any Barber".
- View live queue position.
- Monitor estimated waiting time.
- Cancel their queue entry.
- Receive turn notifications.

---

## Receptionist

Reception staff can:

- View the entire queue.
- Add walk-in customers.
- Call the next customer.
- Cancel customers.
- Mark customers as No-show.
- Monitor barber availability.
- View waiting times.

---

## Barber

Barbers can:

- View their assigned customer.
- Start service.
- Complete service.
- Mark themselves available.
- Go on break.
- View their next assigned customer.

---

## Owner / Administrator

Owners can:

- Manage salon services.
- Enable or disable services.
- Manage barbers.
- View daily statistics.
- Open or close online queue.
- Monitor overall salon activity.

---

# Core Features

## Customer Features

- Join queue remotely.
- Multi-service selection.
- Preferred barber selection.
- Live waiting status.
- Estimated waiting time.
- Queue cancellation.
- Real-time notifications.
- English and Gujarati language support.

---

## Reception Features

- Live queue dashboard.
- Walk-in customer registration.
- Call Next.
- Cancel customer.
- Mark No-show.
- Queue monitoring.
- Barber availability monitoring.

---

## Barber Features

- View current customer.
- Service timer.
- Start service.
- Finish service.
- Break mode.
- View next customer.

---

## Waiting Area Display

- Live queue display.
- Current customer per barber.
- Upcoming tokens.
- Flash newly called token.
- Automatic refresh.

---

## Admin Features

- Manage services.
- Manage service duration.
- Manage service pricing.
- Enable/Disable services.
- Manage barbers.
- Open/Close online queue.
- View daily statistics.

---

# Functional Requirements

The system shall:

1. Allow customers to join the queue online.
2. Generate unique queue tokens.
3. Calculate estimated waiting time.
4. Support multiple active barbers.
5. Respect preferred barber selection.
6. Support "Any Barber" selection.
7. Synchronize queue updates in real time.
8. Prevent duplicate queue entries for the same phone number.
9. Allow walk-in registration.
10. Allow customer cancellation.
11. Support No-show handling.
12. Maintain queue order.
13. Display live queue information.
14. Support multilingual UI.

---

# Non-Functional Requirements

The application should provide:

- Responsive design.
- Mobile-first interface.
- Fast page loads.
- Real-time synchronization within 5 seconds.
- Clean and modern UI.
- High code quality.
- Scalable architecture.
- Strong input validation.
- Secure API endpoints.
- Maintainable project structure.

---

# Technology Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Zustand
- TanStack Query
- React Router
- Framer Motion

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- WebSockets
- Pydantic

---

# Design Language

The application should have a premium salon appearance.

Primary Theme

- Dark Charcoal (#1F2937)

Accent Color

- Gold (#D4A017)

Design Principles

- Minimal
- Elegant
- Spacious
- Mobile-first
- Modern
- Professional

---

# Assumptions

- Internet connection is available.
- Customers possess a smartphone.
- Staff devices remain connected during salon hours.
- The backend is always available.
- Multiple browser sessions can remain synchronized through WebSockets.

---

# Out of Scope (Do Not Build)

The following features are intentionally excluded from Version 1:

- Online payment
- Appointment scheduling
- Future bookings
- SMS notifications
- WhatsApp notifications
- Email notifications
- Customer accounts
- Authentication system
- Loyalty programs
- Membership plans
- Product inventory
- Billing system
- Employee payroll
- Multi-branch support
- AI recommendations

---

# Success Criteria

The project will be considered successful if:

- Customers can join the queue in under one minute.
- Waiting times update automatically.
- Reception can manage queues efficiently.
- Barber screens remain synchronized.
- TV display reflects live queue changes.
- Queue rules are consistently enforced.
- All interfaces are responsive.
- The application is ready for deployment.

---

# Future Enhancements

Possible future improvements include:

- Appointment booking
- Online payments
- Push notifications
- Customer accounts
- QR code check-in
- Loyalty rewards
- Analytics dashboard
- AI-based waiting time prediction
- Multi-branch management
- Native mobile application

---

# MVP Deliverables

The Minimum Viable Product must include:

- Customer Queue System
- Reception Dashboard
- Barber Dashboard
- Waiting Area Display
- Owner Settings
- Real-time synchronization
- Queue management rules
- Responsive UI
- English/Gujarati language support

No additional features should be implemented unless explicitly requested.