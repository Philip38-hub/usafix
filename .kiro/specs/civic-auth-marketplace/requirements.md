# Requirements Document

## Introduction

This feature transforms the existing authentication system into a comprehensive house repair and cleaning services marketplace with Civic Auth integration. The system will support both clients seeking services and service providers offering their expertise, with a focus on the African market (specifically Kenya). The application will use local database for testing, implement Civic Auth for secure decentralized login, and provide a complete user flow with mocked backend functionality.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to set up a local database environment, so that I can test the application without relying on external services during development.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL connect to a local SQLite database
2. WHEN database migrations are run THEN the system SHALL create all necessary tables for users, providers, bookings, and ratings
3. WHEN the application is in development mode THEN the system SHALL use the local database instead of Supabase
4. IF the local database file doesn't exist THEN the system SHALL create it automatically with proper schema

### Requirement 2

**User Story:** As a client or service provider, I want to authenticate using Civic Auth, so that I can securely access the platform with decentralized identity verification.

#### Acceptance Criteria

1. WHEN a user visits the login page THEN the system SHALL display a "Sign in with Civic" button prominently
2. WHEN a user clicks "Sign in with Civic" THEN the system SHALL initiate the Civic Auth flow using iframe, redirect, or new_tab display mode
3. WHEN Civic Auth authentication is successful THEN the system SHALL determine the user's role (client or provider) from user profile data
4. IF the user is a client THEN the system SHALL redirect to the browsing/landing page
5. IF the user is a provider THEN the system SHALL redirect to the provider dashboard
6. WHEN Civic Auth is unavailable THEN the system SHALL provide email/password fallback authentication
7. WHEN authentication fails THEN the system SHALL display clear error messages and retry options
8. WHEN a user completes Civic Auth for the first time THEN the system SHALL create a profile with role selection

### Requirement 3

**User Story:** As a client, I want to browse available service providers without logging in, so that I can explore services before committing to create an account.

#### Acceptance Criteria

1. WHEN a user visits the landing page THEN the system SHALL display a list of service providers with mocked data
2. WHEN viewing providers THEN the system SHALL show name, service type, location, star ratings, and price for each provider
3. WHEN a user wants to filter THEN the system SHALL provide filters for service type, price range, and distance
4. WHEN a user toggles map view THEN the system SHALL display providers on an interactive map using Leaflet
5. WHEN a user clicks on a provider THEN the system SHALL show detailed provider information
6. IF a user tries to book without authentication THEN the system SHALL prompt for login

### Requirement 4

**User Story:** As a client, I want to book services and make payments, so that I can secure the services I need for my home.

#### Acceptance Criteria

1. WHEN an authenticated client selects a provider THEN the system SHALL display available time slots
2. WHEN a client chooses a date and time THEN the system SHALL create a booking request
3. WHEN confirming a booking THEN the system SHALL display payment options (M-Pesa simulation and cash)
4. WHEN payment is processed THEN the system SHALL simulate M-Pesa payment flow with mocked responses
5. WHEN booking is confirmed THEN the system SHALL send confirmation details to both client and provider
6. WHEN a service is completed THEN the system SHALL prompt the client to rate the service

### Requirement 5

**User Story:** As a service provider, I want to manage my profile and bookings through a dashboard, so that I can efficiently run my service business.

#### Acceptance Criteria

1. WHEN a provider logs in THEN the system SHALL display a dashboard with profile information
2. WHEN viewing the dashboard THEN the system SHALL show upcoming bookings, completed services, and ratings
3. WHEN a provider updates availability THEN the system SHALL reflect changes in booking options
4. WHEN new bookings are received THEN the system SHALL notify the provider
5. WHEN viewing ratings THEN the system SHALL display average rating and individual feedback

### Requirement 6

**User Story:** As a client, I want to rate and provide feedback for completed services, so that I can help other clients make informed decisions.

#### Acceptance Criteria

1. WHEN a service is marked as completed THEN the system SHALL prompt the client for rating
2. WHEN submitting a rating THEN the system SHALL accept 1-5 star ratings and optional text feedback
3. WHEN a rating is submitted THEN the system SHALL update the provider's average rating
4. WHEN viewing provider profiles THEN the system SHALL display aggregated ratings and recent feedback
5. IF a client doesn't rate within 7 days THEN the system SHALL send a reminder notification

### Requirement 7

**User Story:** As a user, I want the application to reflect African context and accessibility needs, so that it serves the target market effectively.

#### Acceptance Criteria

1. WHEN displaying content THEN the system SHALL use African names, locations, and cultural context in mocked data
2. WHEN accessing the application THEN the system SHALL support both English and Swahili languages
3. WHEN using the interface THEN the system SHALL be optimized for mobile devices (Android focus)
4. WHEN navigating THEN the system SHALL meet WCAG 2.1 accessibility standards
5. WHEN displaying prices THEN the system SHALL use Kenyan Shilling (KSH) currency format
6. WHEN showing locations THEN the system SHALL include Kenyan cities and neighborhoods

### Requirement 8

**User Story:** As a developer, I want comprehensive mock data and backend simulation, so that the application demonstrates full functionality without external dependencies.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL populate the database with realistic mock data
2. WHEN API calls are made THEN the system SHALL respond with mocked data that simulates real backend behavior
3. WHEN payments are processed THEN the system SHALL simulate M-Pesa API responses
4. WHEN real-time updates occur THEN the system SHALL simulate live data changes
5. IF external services are unavailable THEN the system SHALL continue functioning with mocked responses