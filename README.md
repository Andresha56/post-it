# Social Media Management Platform

A centralized platform for creating, organizing, previewing, and
scheduling social media content across connected accounts, with
AI-assisted content creation and a unified publishing workflow.

> **Project status:** Update this section to reflect the current
> implementation. The architecture below documents the intended design
> based on the project stack and features; verify names, operations, and
> integrations against the codebase before treating every item as
> implemented.

## Table of Contents

-   [Overview](#overview)
-   [Core Features](#core-features)
-   [Technology Stack](#technology-stack)
-   [Architecture](#architecture)
-   [Low-Level Design (LLD)](#low-level-design-lld)
    -   [Module Responsibilities](#module-responsibilities)
    -   [Authentication and Request
        Flow](#authentication-and-request-flow)
    -   [Connect Social Accounts](#connect-social-accounts)
    -   [Schedule and Publish Posts](#schedule-and-publish-posts)
    -   [Frontend Design](#frontend-design)
    -   [Backend Design](#backend-design)
-   [Data Model](#data-model)
-   [GraphQL API Design](#graphql-api-design)
-   [Security Considerations](#security-considerations)
-   [Error Handling](#error-handling)
-   [Project Structure](#project-structure)
-   [Environment Variables](#environment-variables)
-   [Local Setup](#local-setup)
-   [Testing Strategy](#testing-strategy)
-   [Design Decisions and Trade-offs](#design-decisions-and-trade-offs)
-   [Future Improvements](#future-improvements)

## Overview

Managing multiple social media accounts often requires switching between
platforms to draft content, coordinate publishing times, and track post
status. This application aims to provide one workspace for those tasks.

The application separates user authentication, application data, and
social publishing responsibilities:

-   **AWS Cognito** handles identity and authentication.
-   **The application backend** validates access tokens and enforces
    ownership of application resources.
-   **MongoDB** stores application-owned data such as user profiles,
    connected-account references, and scheduled-post metadata.
-   **Zernio** acts as the external integration layer for supported
    social-account connections and publishing operations.
-   **AI content generation** helps users draft content; users remain in
    control of reviewing and scheduling it.

## Core Features

Adjust this list to match what is implemented in the current branch.

-   User registration, email verification, login, and authenticated
    routes.
-   A dashboard for managing social publishing activity.
-   Connect and manage supported social media accounts.
-   Create and edit post drafts.
-   Generate or improve post copy with an AI provider.
-   Preview post content before scheduling.
-   Schedule posts for a selected date and time.
-   View posts in a calendar and monitor their publishing status.
-   Validate user input on the client and server.
-   Keep each user's data isolated from other users' data.

## Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Responsibility
  ----------------------- ----------------------- -----------------------
  Frontend                React, TypeScript       UI and application
                                                  interactions

  Styling                 Tailwind CSS            Responsive layout and
                                                  styling

  Validation              Zod                     Runtime validation of
                                                  form/input data

  Authentication          AWS Cognito             Identity, sign-in, and
                                                  email verification

  API                     GraphQL, Apollo Server  Typed operations
                                                  between frontend and
                                                  backend

  Backend                 Node.js                 Business logic and
                                                  integration
                                                  orchestration

  Database                MongoDB                 Persistent application
                                                  data

  Social integration      Zernio                  Supported social
                                                  account connection and
                                                  publishing workflows

  Testing                 Add the libraries used  Unit, integration, and
                          in this repository      end-to-end coverage
  -----------------------------------------------------------------------

## Architecture

### High-level architecture

``` mermaid
flowchart TD
    U[User] --> FE[React + TypeScript Frontend]
    FE --> AUTH[AWS Cognito]
    FE -->|GraphQL + access token| API[Apollo Server / Node.js]
    API --> MW[Authentication and Authorization]
    MW --> SVC[Application Services]
    SVC --> DB[(MongoDB)]
    SVC --> Z[Zernio Integration]
    SVC --> AI[AI Provider]
    Z --> SOCIAL[Supported Social Platforms]
```

### Architectural boundaries

1.  **Presentation layer:** renders screens, handles user actions, and
    performs immediate form validation.
2.  **Authentication layer:** Cognito authenticates the user. The
    backend independently verifies the access token on protected
    requests.
3.  **GraphQL layer:** validates and routes queries and mutations to
    resolver functions.
4.  **Service layer:** contains business rules and coordinates database
    and external-provider operations.
5.  **Persistence layer:** reads and writes application-owned records
    through repository/model functions.
6.  **Integration layer:** wraps Zernio and AI-provider calls so
    provider-specific details do not spread throughout business logic.

Resolvers should remain thin. Business rules belong in services, and
external API calls should be isolated behind integration modules.

## Low-Level Design (LLD)

### Module Responsibilities

  -----------------------------------------------------------------------
  Module                              Responsibility
  ----------------------------------- -----------------------------------
  `AuthModule`                        Verify Cognito access tokens and
                                      expose the authenticated principal

  `UserService`                       Create or update the application's
                                      user profile

  `SocialAccountService`              Connect, list, refresh, or
                                      disconnect provider accounts

  `PostService`                       Create drafts, edit content,
                                      validate post ownership, and manage
                                      status

  `SchedulerService`                  Validate scheduling requests and
                                      coordinate scheduled publishing

  `PublishingService`                 Submit eligible posts to the social
                                      integration provider and record
                                      outcomes

  `AIContentService`                  Send prompts to the configured AI
                                      provider and normalize generated
                                      output

  `PostRepository`                    Encapsulate post persistence and
                                      queries

  `SocialAccountRepository`           Encapsulate connected-account
                                      persistence and queries

  `ProviderClient`                    Encapsulate Zernio API calls,
                                      timeouts, and provider error
                                      mapping
  -----------------------------------------------------------------------

These are logical responsibilities, not a claim that the repository
already contains classes with these exact names.

### Authentication and Request Flow

``` mermaid
sequenceDiagram
    actor User
    participant UI as React App
    participant Cognito as AWS Cognito
    participant API as Apollo Server
    participant Auth as Auth Middleware
    participant Service as Application Service
    participant DB as MongoDB

    User->>UI: Sign in
    UI->>Cognito: Authenticate credentials
    Cognito-->>UI: Tokens
    UI->>API: GraphQL request + access token
    API->>Auth: Verify bearer token
    Auth->>Auth: Validate signature, issuer, expiry and token_use
    Auth-->>API: Authenticated user identity
    API->>Service: Execute operation
    Service->>DB: Read/write user-scoped data
    DB-->>Service: Result
    Service-->>API: Domain result
    API-->>UI: GraphQL response
```

**Important:** send a Cognito **access token** when the backend verifier
is configured to accept access tokens. An ID token serves a different
purpose and may be rejected by that verifier. Never trust a user ID
supplied only in request arguments; derive the authenticated identity
from the verified token.

Email verification and signup are handled through Cognito's configured
flow. On the first authenticated application request---or a dedicated
onboarding operation---the backend can create or reconcile a user
profile using the verified Cognito `sub` as the stable identity key.
Make profile creation idempotent so retries do not create duplicates.

### Connect Social Accounts

``` mermaid
sequenceDiagram
    actor User
    participant UI as React App
    participant API as GraphQL API
    participant SVC as SocialAccountService
    participant DB as MongoDB
    participant Z as Zernio

    User->>UI: Select "Connect account"
    UI->>API: Request connection flow
    API->>SVC: Start connection for authenticated user
    SVC->>Z: Create/retrieve provider connection flow
    Z-->>SVC: Authorization URL or provider response
    SVC-->>API: Connection flow result
    API-->>UI: Return approved redirect details
    UI->>User: Open provider authorization
    User->>Z: Authorize selected account
    Z-->>SVC: Provider callback/webhook or connection status
    SVC->>Z: Verify/fetch connection details as needed
    SVC->>DB: Save provider account reference and owner
    UI->>API: Query connected accounts
    API->>DB: Fetch accounts for authenticated user
    API-->>UI: Connected account list
```

The exact callback/webhook mechanism depends on the provider's supported
integration flow. Verify signatures where supported, validate state/CSRF
protection for redirect flows, and do not mark an account connected
solely because the browser returned to a success page.

**Profile creation decision:** Cognito can remain the identity source,
while the app maintains its own user profile keyed by Cognito `sub`.
Create the local profile after successful verification or lazily on the
first authenticated request. Create a Zernio user/profile only if the
provider's API and account model require it; avoid creating duplicate
external profiles on every login. Make retries safe.

### Schedule and Publish Posts

``` mermaid
sequenceDiagram
    actor User
    participant UI as React App
    participant API as GraphQL API
    participant PS as PostService
    participant DB as MongoDB
    participant Z as Zernio

    User->>UI: Choose accounts, content and schedule time
    UI->>API: schedulePost(input)
    API->>PS: Validate user, accounts, content and time
    PS->>DB: Confirm selected accounts belong to user
    PS->>DB: Save post with scheduled status
    DB-->>PS: Post record
    PS-->>API: Scheduled post
    API-->>UI: Updated post/calendar
    Note over Z: At publish time, provider scheduling or a backend worker executes the job
    Z-->>PS: Publishing result/webhook (if configured)
    PS->>DB: Update status and provider result
```

A production implementation should choose one clear scheduling owner:

-   **Provider-managed scheduling:** send the post and schedule time to
    Zernio if the provider supports the required platform and scheduling
    options.
-   **Application-managed scheduling:** store the scheduled job and run
    a durable worker/queue that publishes it at the due time.

Do not rely on a `setTimeout` inside a web request or a single Node.js
process for durable scheduling. Persist scheduling state, use retries
with backoff, make publication idempotent where possible, and record
provider job IDs and failure reasons. Use UTC timestamps in storage and
convert to the user's timezone in the UI.

### Frontend Design

Suggested feature-oriented organization:

-   **Pages:** landing, authentication, dashboard, connected accounts,
    composer, calendar, and settings.
-   **Components:** reusable buttons, dialogs, form fields, post
    previews, account selectors, and status badges.
-   **Features:** auth, social accounts, post composer, scheduling,
    calendar, and AI content.
-   **API client:** Apollo Client setup, GraphQL documents, error
    handling, and authentication headers.
-   **Schemas:** Zod schemas for forms and user input.
-   **Route guards:** redirect unauthenticated users to the login page
    while keeping public routes accessible.

A route guard improves navigation and user experience; it is **not** a
security boundary. The backend must authenticate and authorize every
protected operation.

### Backend Design

A maintainable backend can use the following flow:

``` text
GraphQL Operation
      |
      v
Resolver (transport mapping)
      |
      v
Service (business rules)
      |
      +------> Repository / Model ------> MongoDB
      |
      +------> Zernio Client -----------> Zernio API
      |
      +------> AI Client ---------------> AI Provider
```

Recommended responsibilities:

-   **Context factory:** extracts and verifies the bearer access token
    and attaches a minimal authenticated principal to GraphQL context.
-   **Resolvers:** validate operation arguments, call services, and
    return domain results.
-   **Services:** enforce ownership, allowed state transitions, and
    business rules.
-   **Repositories:** encapsulate database access and user-scoped
    queries.
-   **Provider clients:** isolate HTTP requests, credentials, timeouts,
    rate limits, and provider error mapping.
-   **Configuration:** load and validate required environment variables
    at application startup.

## Data Model

The following are **proposed logical schemas**. Adapt fields and names
to the actual Mongoose models in the repository.

### User

  -----------------------------------------------------------------------
  Field                   Type                    Notes
  ----------------------- ----------------------- -----------------------
  `_id`                   ObjectId                Internal document ID

  `cognitoSub`            String                  Required, unique
                                                  identity key from
                                                  verified Cognito token

  `email`                 String                  Normalized email; avoid
                                                  treating it as the
                                                  immutable identity key

  `name`                  String                  Optional display name

  `createdAt`             Date                    Creation timestamp

  `updatedAt`             Date                    Last update timestamp
  -----------------------------------------------------------------------

**Index:** unique index on `cognitoSub`.

### SocialAccount

  ------------------------------------------------------------------------
  Field                    Type                    Notes
  ------------------------ ----------------------- -----------------------
  `_id`                    ObjectId                Internal document ID

  `userId`                 ObjectId                Owner reference

  `provider`               String                  Provider/platform
                                                   identifier

  `providerAccountId`      String                  External account ID

  `displayName`            String                  Account label

  `status`                 String                  For example:
                                                   `connected`, `expired`,
                                                   `disconnected`

  `providerConnectionId`   String                  External connection
                                                   reference, if
                                                   applicable

  `createdAt` /            Date                    Timestamps
  `updatedAt`                                      
  ------------------------------------------------------------------------

**Indexes:** index `userId`; consider a unique compound index on
`{ userId, provider, providerAccountId }` if that matches the intended
account rules.

Store only the provider references and metadata needed by the
application. Do not persist provider secrets or long-lived tokens unless
required and protected using an appropriate secret-storage/encryption
strategy.

### Post

  -----------------------------------------------------------------------
  Field                   Type                    Notes
  ----------------------- ----------------------- -----------------------
  `_id`                   ObjectId                Internal document ID

  `userId`                ObjectId                Owner reference

  `content`               String                  Post copy

  `media`                 Array                   Media
                                                  references/metadata, if
                                                  supported

  `socialAccountIds`      ObjectId\[\]            Selected connected
                                                  accounts

  `scheduledAt`           Date                    UTC schedule time;
                                                  optional for drafts

  `status`                String                  `draft`, `scheduled`,
                                                  `publishing`,
                                                  `published`, `failed`,
                                                  `cancelled`

  `providerPostIds`       Array                   Provider identifiers
                                                  and per-account
                                                  outcomes

  `lastError`             String                  Sanitized failure
                                                  details, if any

  `createdAt` /           Date                    Timestamps
  `updatedAt`                                     
  -----------------------------------------------------------------------

**Indexes:** `{ userId: 1, updatedAt: -1 }` for a user's recent posts;
`{ status: 1, scheduledAt: 1 }` for worker polling if the app owns
scheduling. Add indexes based on actual query patterns and validate them
with query plans.

### Relationships

``` mermaid
erDiagram
    USER ||--o{ SOCIAL_ACCOUNT : owns
    USER ||--o{ POST : creates
    POST }o--o{ SOCIAL_ACCOUNT : targets

    USER {
        ObjectId _id
        string cognitoSub
        string email
        string name
    }
    SOCIAL_ACCOUNT {
        ObjectId _id
        ObjectId userId
        string provider
        string providerAccountId
        string status
    }
    POST {
        ObjectId _id
        ObjectId userId
        string content
        datetime scheduledAt
        string status
    }
```

The many-to-many relationship between posts and social accounts can be
represented by `socialAccountIds` for a simple model. If per-account
publishing status, retries, or platform-specific content becomes
complex, use a separate `PostPublication` collection/document for each
target account.

## GraphQL API Design

Illustrative operation names and fields---align them with the actual
schema.

### Example operations

``` graphql
type Query {
  me: User!
  socialAccounts: [SocialAccount!]!
  posts(status: PostStatus, limit: Int, cursor: String): PostConnection!
}

type Mutation {
  syncMyProfile: User!
  startSocialAccountConnection(provider: SocialProvider!): ConnectionFlow!
  disconnectSocialAccount(accountId: ID!): Boolean!
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  schedulePost(id: ID!, scheduledAt: String!, accountIds: [ID!]!): Post!
  cancelScheduledPost(id: ID!): Post!
  generatePostContent(input: GenerateContentInput!): GeneratedContent!
}
```

### API rules

-   Derive the user identity from the verified Cognito access token.
-   Apply ownership checks in every service for posts and social
    accounts.
-   Validate inputs and enum values on the server; client-side Zod
    validation alone is insufficient.
-   Use cursor pagination for growing lists.
-   Avoid returning provider secrets, tokens, or internal stack traces.
-   Define predictable error codes for unauthenticated, forbidden,
    invalid input, not found, rate limited, and provider failures.
-   Avoid exposing arbitrary provider operations directly to clients;
    wrap them in application-level services.

## Security Considerations

-   Verify Cognito JWT signature, issuer, expiration, and expected token
    use with a maintained verifier.
-   Require HTTPS outside local development and keep secrets out of
    source control.
-   Keep authorization checks on the server; filter database queries by
    authenticated `userId`.
-   Validate OAuth state and callback/webhook authenticity according to
    provider capabilities.
-   Protect external API credentials and avoid logging tokens or
    sensitive headers.
-   Validate and limit user-supplied content, file uploads, and request
    sizes.
-   Apply rate limits to authentication-sensitive and AI-generation
    operations.
-   Use least-privilege IAM permissions and restrict CORS to known
    frontend origins.
-   Return sanitized errors to clients and retain detailed diagnostics
    only in protected server logs.
-   Add audit events for sensitive account connection and disconnection
    actions.

## Error Handling

Use a consistent error-handling approach across resolvers, services, and
provider clients.

  -----------------------------------------------------------------------
  Scenario                            Expected behavior
  ----------------------------------- -----------------------------------
  Missing or invalid token            Reject the request as
                                      unauthenticated

  User does not own a resource        Return a forbidden/not-found
                                      response without leaking other
                                      users' data

  Invalid input                       Return a validation error with safe
                                      field details

  Social provider rate limit          Retry only when safe; respect
                                      provider guidance and backoff

  Provider connection expired         Mark or report the connection state
                                      and ask the user to reconnect

  Publishing fails                    Persist the failure state and a
                                      sanitized reason; support safe
                                      retry

  Database unavailable                Return a generic service error and
                                      log diagnostic context

  AI provider unavailable             Explain generation is temporarily
                                      unavailable; preserve the user's
                                      draft
  -----------------------------------------------------------------------

For publishing, track each target account separately when one post can
be sent to multiple platforms. One platform failing should not
incorrectly mark every other target as failed.

## Project Structure

A suggested structure for a repository with separate frontend and
backend applications:

``` text
social-media-platform/
├── client/
│   └── src/
│       ├── app/                 # App setup, providers and routing
│       ├── components/          # Shared UI components
│       ├── features/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── social-accounts/
│       │   ├── posts/
│       │   ├── calendar/
│       │   └── ai-content/
│       ├── graphql/             # Queries, mutations and fragments
│       ├── lib/                 # Apollo, Cognito and shared clients
│       ├── schemas/             # Zod schemas
│       └── types/
├── server/
│   └── src/
│       ├── config/
│       ├── graphql/
│       │   ├── typeDefs/
│       │   ├── resolvers/
│       │   └── context/
│       ├── middleware/
│       ├── modules/
│       │   ├── users/
│       │   ├── social-accounts/
│       │   ├── posts/
│       │   └── publishing/
│       ├── integrations/
│       │   ├── zernio/
│       │   └── ai/
│       ├── models/
│       ├── repositories/
│       ├── services/
│       └── utils/
├── .env.example
├── .gitignore
└── README.md
```

This is a reference layout, not a statement about the current folder
structure. Keep your existing structure if it is already working;
reorganize only when it improves maintainability.

## Environment Variables

Create local `.env` files for the frontend and backend, as appropriate.
**Never commit real credentials.** The names below are examples; use the
exact names expected by your application.

### Frontend example

``` dotenv
VITE_API_URL=http://localhost:4000/graphql
VITE_COGNITO_USER_POOL_ID=your_user_pool_id
VITE_COGNITO_CLIENT_ID=your_app_client_id
```

### Backend example

``` dotenv
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/social_media_platform
AWS_REGION=your_aws_region
COGNITO_USER_POOL_ID=your_user_pool_id
ZERNIO_API_KEY=replace_with_secret
AI_API_KEY=replace_with_secret
CLIENT_ORIGIN=http://localhost:5173
```

Only define variables for integrations enabled in your build. Validate
required configuration at startup and keep server-only secrets out of
variables prefixed with `VITE_`, because Vite exposes those values to
client-side code.

## Local Setup

The exact commands depend on the repository's package manager and
scripts. A typical workflow is:

1.  Clone the repository.
2.  Install frontend and backend dependencies in their respective
    directories.
3.  Create environment files based on `.env.example`.
4.  Configure the Cognito user pool and app client, including the
    required email-verification settings.
5.  Configure MongoDB and the required Zernio/AI provider credentials.
6.  Start the backend and frontend using the scripts defined in their
    respective `package.json` files.
7.  Open the frontend's local development URL and test signup, email
    verification, login, and protected routes.
8.  Test account connection and publishing only with provider-supported
    accounts and permissions.

Example commands (replace these with the actual package scripts):

``` bash
# Run in the client directory
npm install
npm run dev

# Run in the server directory
npm install
npm run dev
```

Do not add scripts to the README unless they exist in the corresponding
`package.json`.

## Testing Strategy

Recommended coverage:

-   **Unit tests:** input validation, post state transitions, ownership
    rules, and service logic.
-   **Resolver/service integration tests:** authenticated and
    unauthenticated GraphQL operations.
-   **Authentication tests:** invalid token, expired token, wrong token
    type, and missing bearer token.
-   **Authorization tests:** user A must not read or modify user B's
    posts or accounts.
-   **Provider tests:** mocked Zernio responses, timeouts, rate limits,
    and provider errors.
-   **Scheduling tests:** timezone conversion, past timestamps, retries,
    duplicate delivery protection, and partial multi-account failures.
-   **Frontend tests:** form validation, route guards, account
    selection, calendar behavior, and loading/error states.
-   **End-to-end tests:** signup, verification, login, connecting a test
    account, drafting, and scheduling.

Use sandbox/test accounts where available. Avoid sending test posts to
real public accounts.

## Design Decisions and Trade-offs

-   **Cognito for identity:** delegates credential management and email
    verification to a managed identity service, while the application
    still owns resource authorization.
-   **GraphQL for client data needs:** lets screens request the fields
    they need, but requires disciplined resolver design, pagination, and
    query limits.
-   **MongoDB for application records:** provides flexible document
    models for posts and provider metadata; indexes and schema
    validation remain important.
-   **Provider adapter:** isolates Zernio-specific API behavior and
    makes integration tests easier.
-   **Server-side authorization:** prevents users from accessing another
    user's records by changing IDs in a request.
-   **Durable scheduling:** a queue/worker or provider-managed scheduler
    is more reliable than in-memory timers, at the cost of additional
    operational complexity.

## Future Improvements

Prioritize based on product needs:

-   Durable queue-based scheduling, retries, and dead-letter handling.
-   Per-platform publishing status and an activity/audit timeline.
-   Token-expiration monitoring and a reconnect workflow.
-   Media storage, validation, and upload processing.
-   Rate limiting, observability, structured logs, and alerting.
-   Role-based collaboration for teams and workspaces.
-   Analytics and performance reporting where supported by provider
    APIs.
-   Automated CI checks and deployment pipelines.

------------------------------------------------------------------------

## Before publishing this README

To make this documentation fully accurate, verify:

-   [ ] Actual frontend and backend folder structure.
-   [ ] Existing GraphQL queries, mutations, and schema names.
-   [ ] Actual Mongoose models and indexes.
-   [ ] Whether scheduling is handled by Zernio or by an application
    worker.
-   [ ] The exact AI provider and implemented AI features.
-   [ ] Actual `package.json` scripts and required environment variable
    names.
-   [ ] Which features are complete, in progress, or planned.
