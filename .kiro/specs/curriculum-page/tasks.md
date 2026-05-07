# Implementation Plan: Curriculum Page

## Overview

Implement the read-only Curriculum page at `/curriculum` that displays required
subjects based on the adult user's state compliance laws. The work spans two
layers: a NestJS backend (new `ComplianceController` and `ComplianceService` in
the existing `ComplianceModule`) and a TanStack Router frontend (updated route
component, new API service, new query hook, and a `SubjectCard` component). All
property-based tests use `fast-check` (already installed) with a minimum of 100
iterations per property.

## Tasks

- [ ] 1. Create `ComplianceService` in the backend
  - Create `nest-app/src/compliance/compliance.service.ts`
  - Inject `@InjectModel(StateComplianceLaws.name)` Mongoose model
  - Implement `findByState(state: string): Promise<StateComplianceLaws>`:
    - Normalize `state` to uppercase before querying
    - Query `{ abbreviation: state.toUpperCase() }` on the
      `state_compliance_laws` collection
    - Throw `NotFoundException` if no document is found
    - Return the full `StateComplianceLaws` document on success
  - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 1.1 Write unit tests for `ComplianceService`
    - Test: returns document when abbreviation matches (case-insensitive)
    - Test: throws `NotFoundException` when no document found
    - Test: lowercase input is normalized and still matches
    - _Requirements: 7.2, 7.3_

- [ ] 2. Create `ComplianceController` and update `ComplianceModule`
  - Create `nest-app/src/compliance/compliance.controller.ts`
  - Add `@Controller('compliance')` with `@UseGuards(AuthGuard)`
  - Add `@Get(':state')` handler that calls
    `complianceService.findByState(state)` and returns the result
  - Add Swagger decorators (`@ApiOperation`, `@ApiOkResponse`,
    `@ApiNotFoundResponse`, `@ApiUnauthorizedResponse`) consistent with existing
    controller style
  - Update `nest-app/src/compliance/compliance.module.ts` to declare
    `ComplianceController` in `controllers` and `ComplianceService` in
    `providers`
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 2.1 Write unit tests for `ComplianceController`
    - Test: returns 200 with document when state matches
    - Test: propagates `NotFoundException` (resulting in 404) when state not
      found
    - Test: `AuthGuard` is applied (unauthenticated request returns 401)
    - _Requirements: 7.2, 7.3, 7.4_

- [ ] 3. Checkpoint — Ensure backend tests pass
  - Run `pnpm test --run` inside `nest-app/` and confirm all tests in
    `compliance.service.spec.ts` and `compliance.controller.spec.ts` pass
  - Fix any TypeScript errors surfaced by `tsc -b` inside `nest-app/`
  - Ask the user if any questions arise before continuing

- [ ] 4. Create `ComplianceServices` API service on the frontend
  - Create `tanstack-router/src/api/services/compliance.services.ts`
  - Define `ComplianceLaws` type:
    `{ _id: string; state: string; abbreviation: string; subjectsRequiredTopicIds: string[] }`
  - Implement `getComplianceLaws(state: string): Promise<ComplianceLaws>`:
    - Use the authenticated `api` client (not `unauthenticatedApi`)
    - Call `api.get(\`compliance/${encodeURIComponent(state)}\`)`
    - Return `response.json()`
  - _Requirements: 3.1_

- [ ] 5. Create `useComplianceLaws` query hook
  - Create `tanstack-router/src/hooks/use-compliance-laws.ts`
  - Use `useQuery` with query key `['compliance', state]`
  - Call `ComplianceServices.getComplianceLaws(state!)`
  - Set `enabled: !!state` so the query only fires when `state` is a non-empty
    string
  - _Requirements: 3.1, 3.4, 3.5_

  - [ ] 5.1 Write unit tests for `useComplianceLaws`
    - Test: query is disabled when `state` is null
    - Test: query is disabled when `state` is undefined
    - Test: query is enabled when `state` is a non-empty string
    - _Requirements: 3.1_

- [ ] 6. Create `useSubjects` query hook (if not already present)
  - Check whether a `useSubjects` hook already exists in
    `tanstack-router/src/hooks/`
  - If absent, create `tanstack-router/src/hooks/use-subjects.ts`:
    - Use `useQuery` with query key `['subjects']`
    - Call `SubjectsServices.getSubjects()`
  - _Requirements: 4.1_

- [ ] 7. Create `SubjectCard` component
  - Create `tanstack-router/src/components/cards/subject-card.tsx`
  - Props: `subject: Subject` (from `subjects.services.ts`)
  - Render: subject `icon` (as an `<img>` or icon element), subject `name`, and
    apply subject `color` as a visual accent (e.g., left border or background
    tint using an inline style or CSS variable)
  - Do NOT render any add, remove, or edit controls
  - _Requirements: 5.2, 5.5_

  - [ ] 7.1 Write unit tests for `SubjectCard`
    - Test: renders subject `name`
    - Test: renders subject `icon`
    - Test: applies subject `color`
    - Test: no interactive controls (no buttons labelled Add, Remove, or Edit)
    - _Requirements: 5.2, 5.5_

  - [ ] 7.2 Write property test — Property 2: Subject card displays name, icon,
        and color
    - **Property 2: Subject card displays name, icon, and color**
    - Generate `arbitrarySubject()` with random `name`, `icon`, and `color`
      strings
    - Assert: rendered `SubjectCard` output contains the subject's `name`,
      `icon`, and `color` values
    - **Validates: Requirement 5.2**

  - [ ] 7.3 Write property test — Property 3: No interactive controls for any
        subject list
    - **Property 3: No interactive controls rendered for any subject list**
    - Generate `fc.array(arbitrarySubject(), { minLength: 0, maxLength: 20 })`
    - Assert: rendered output contains zero buttons or links labelled "Add",
      "Remove", or "Edit"
    - **Validates: Requirement 5.5**

- [ ] 8. Implement `CurriculumRoute` component
  - Update `tanstack-router/src/routes/(private)/_private.curriculum.tsx`
  - Replace the placeholder component with the full implementation:
    - Call `useLoggedInUser()` to get the user's `state` field from their
      profile
    - Call `useComplianceLaws(state)` — pass `state` from the profile (null when
      not yet loaded)
    - Call `useSubjects()` to get the full catalog
    - Read `activeStudent` from `useStudent()`
    - Derive `requiredSubjects` by filtering the subjects catalog:
      `subjects.filter(s => complianceLaws.subjectsRequiredTopicIds.includes(s._id))`
    - Render states:
      - Loading (any query loading): loading indicator in place of subject list
      - Error (any query errored): error banner with retry action
      - Missing state (profile loaded but `state` is null/absent): prompt to
        complete profile
      - Empty (`subjectsRequiredTopicIds` is empty or no matches): empty-state
        message
      - Populated: heading, optional active student label, grid of `SubjectCard`
        components
    - When `activeStudent` is set, display
      `Viewing curriculum for {activeStudent.displayName}` as a contextual label
    - When `activeStudent` is null, omit the label
    - No add/remove/edit controls anywhere on the page
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.4, 3.5, 4.1, 4.2, 4.3, 5.1, 5.2,
    5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4_

  - [ ] 8.1 Write unit tests for `CurriculumRoute`
    - Test: shows loading indicator while profile query is loading
    - Test: shows loading indicator while compliance query is loading
    - Test: shows error banner with retry when profile fetch fails
    - Test: shows error banner with retry when compliance fetch fails
    - Test: shows error banner with retry when subjects fetch fails
    - Test: shows profile-completion prompt when profile `state` is null
    - Test: shows empty-state message when `subjectsRequiredTopicIds` is empty
    - Test: renders one `SubjectCard` per required subject
    - Test: shows active student label when `activeStudent` is set
    - Test: omits student label when `activeStudent` is null
    - _Requirements: 2.2, 2.3, 2.4, 3.4, 3.5, 4.2, 4.3, 5.1, 5.3, 6.1, 6.2_

  - [ ] 8.2 Write property test — Property 1: Required subjects list matches
        subjectsRequiredTopicIds
    - **Property 1: Required subjects list matches subjectsRequiredTopicIds**
    - Generate `fc.array(fc.string(), { maxLength: 20 })` as
      `subjectsRequiredTopicIds` and
      `fc.array(arbitrarySubject(), { maxLength: 30 })` as the catalog
    - Assert: `requiredSubjects.length` equals the count of catalog subjects
      whose `_id` is in `subjectsRequiredTopicIds`; every element in
      `requiredSubjects` has its `_id` in `subjectsRequiredTopicIds`
    - **Validates: Requirements 5.1, 5.4**

  - [ ] 8.3 Write property test — Property 4: Required subjects invariant under
        active student change
    - **Property 4: Required subjects are invariant under active student
      change**
    - Generate fixed `subjectsRequiredTopicIds` + catalog + two different
      `HouseholdStudentProfile` values (or null)
    - Assert: `requiredSubjects` computed with student A equals
      `requiredSubjects` computed with student B
    - **Validates: Requirement 6.4**

- [ ] 9. Checkpoint — Ensure all tests pass
  - Run `pnpm test --run` inside `tanstack-router/` and confirm all tests for
    `SubjectCard`, `CurriculumRoute`, and the new hooks pass
  - Run `tsc -b` inside `tanstack-router/` to confirm no TypeScript errors
  - Run `pnpm test --run` inside `nest-app/` to confirm backend tests still pass
  - Verify the TanStack Router route tree is valid (the existing
    `_private.curriculum.tsx` route is already registered; no new route file
    needed)
  - Ask the user if any questions arise before marking complete

## Notes

- Property tests are tagged with a comment in the format:
  `// Feature: curriculum-page, Property N: <property text>`
- The `['user', 'me']` React Query key is the canonical profile cache key;
  `useLoggedInUser()` already uses it — no new profile fetch is needed
- The `['subjects']` query key should be consistent with any existing usage of
  `SubjectsServices.getSubjects()` in the codebase
- The `['compliance', state]` query key scopes compliance data per state so
  switching states (if ever supported) invalidates correctly
- The `ComplianceModule` already imports the `StateComplianceLaws` Mongoose
  model and exports it — the new service can inject it directly without changing
  the module's `imports` array
- The `AuthGuard` used in `ComplianceController` is the same guard used in
  `ProfileController` and other authenticated controllers in the project
- The `SubjectCard` color field is a hex string (e.g., `"#4A90D9"`) — apply it
  as an inline style rather than a Tailwind class since the value is dynamic
