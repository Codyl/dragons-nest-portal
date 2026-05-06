# Implementation Plan: Child Accounts Settings

## Overview

Implement the Child Accounts settings page at `/settings/child-accounts` where
adult users can view, add, archive, and restore their household student drafts.
The work spans two layers: a NestJS backend (schema extension, three new
endpoints, `getMe` update) and a TanStack Router frontend (new route, page
component, sub-components, sidebar link, API service methods, mutation hooks,
and a grade-label utility). All property-based tests use `fast-check` (already
installed in both apps) with a minimum of 100 iterations per property.

## Tasks

- [x] 1. Extend the backend `householdStudentDrafts` schema with `archivedAt`
  - In `nest-app/src/users/entities/user.schema.ts`, add
    `archivedAt: { type: Date, default: null }` to the inline subdocument
    definition inside the `householdStudentDrafts` `@Prop` array
  - Update the TypeScript type annotation on `householdStudentDrafts` to include
    `archivedAt?: Date | null`
  - _Requirements: 8.1, 8.2_

- [x] 2. Update `HouseholdStudentMe` type and `GetMeData` interface
  - In `nest-app/src/profile/profile.service.ts`:
    - Add `archivedAt?: string | null` to the `HouseholdStudentMe` type
    - Add `householdStudentDraftsAll?: HouseholdStudentMe[]` to the `GetMeData`
      interface (update the index signature union type to include the new field)
  - _Requirements: 8.3, 8.4_

- [x] 3. Update `ProfileService.getMe` to filter active students and expose all
     drafts
  - In `nest-app/src/profile/profile.service.ts`, update the `householdStudents`
    mapping to filter drafts where `archivedAt` is null or absent:
    ```
    (user.householdStudentDrafts ?? [])
      .filter(d => !d.archivedAt)
      .map(d => ({ studentDraftId, displayName, currentGrade, lastPromotionYear, archivedAt: null }))
    ```
  - Add `householdStudentDraftsAll` mapping that includes all drafts with their
    `archivedAt` value serialized to ISO string or null:
    ```
    (user.householdStudentDrafts ?? [])
      .map(d => ({ studentDraftId, displayName, currentGrade, lastPromotionYear,
                   archivedAt: d.archivedAt ? d.archivedAt.toISOString() : null }))
    ```
  - Include `householdStudentDraftsAll` in the returned object (alongside the
    existing `householdStudents`) when `accountType === AccountType.Adult`
  - _Requirements: 8.3, 8.4, 6.1_

  - [x] 3.1 Write property test — Property 8: `householdStudents` contains only
        active drafts
    - **Property 8: `householdStudents` contains only active drafts**
    - Generate a user with a mix of active (archivedAt null) and archived
      (archivedAt non-null Date) drafts using `fc.array`
    - Assert: `getMe` response `householdStudents` length equals the count of
      drafts with `archivedAt` null/absent; no archived draft appears in
      `householdStudents`
    - **Validates: Requirements 6.1, 8.4**

- [x] 4. Create `AddHouseholdStudentDto`
  - Create `nest-app/src/profile/dto/add-household-student.dto.ts`
  - Fields:
    - `displayName`: `@IsString()`, `@MinLength(1)`, `@MaxLength(100)`
    - `currentGrade`: `@Type(() => Number)`, `@IsInt()`, `@Min(0)`, `@Max(13)`
  - _Requirements: 7.1, 7.2_

  - [x] 4.1 Write property test — Property 5: POST rejects invalid payloads
    - **Property 5: POST endpoint rejects invalid payloads**
    - Generate invalid `AddHouseholdStudentDto` variants: empty `displayName`,
      `displayName` exceeding 100 characters, `currentGrade` outside 0–13,
      missing required fields
    - Assert: `ProfileService.addHouseholdStudent` throws `BadRequestException`
    - **Validates: Requirement 7.2**

- [x] 5. Implement `ProfileService.addHouseholdStudent`
  - Add `addHouseholdStudent(cognitoSub: string, dto: AddHouseholdStudentDto)`
    to `nest-app/src/profile/profile.service.ts`
  - Fetch user by `cognitoSub`; throw `NotFoundException` if not found/deleted
  - Throw `ForbiddenException` if `accountType !== AccountType.Adult` or
    `ageBandAtRegistration !== AgeBandAtRegistration.Adult18Plus`
  - Generate `studentDraftId` using `crypto.randomUUID()` (Node.js built-in)
  - Set `lastPromotionYear` to `new Date().getFullYear()`
  - Set `archivedAt: null`
  - Append via `$push: { householdStudentDrafts: newDraft }` using
    `usersService.updateByCognitoSub`
  - Return the full updated `householdStudentDrafts` array mapped to
    `HouseholdStudentMe[]` (all drafts, including archivedAt)
  - _Requirements: 3.3, 3.4, 7.1, 7.3, 7.4_

  - [x] 5.1 Write property test — Property 6: POST appends draft (round-trip)
    - **Property 6: POST endpoint appends draft (round-trip)**
    - Generate `arbitraryAddHouseholdStudentDto()` with valid `displayName`
      (1–100 chars) and `currentGrade` (0–13)
    - Assert: returned array length = original length + 1; last element matches
      input DTO fields; `archivedAt` is null on the new entry
    - **Validates: Requirements 3.4, 7.1**

- [x] 6. Implement `ProfileService.archiveHouseholdStudent`
  - Add `archiveHouseholdStudent(cognitoSub: string, studentDraftId: string)` to
    `nest-app/src/profile/profile.service.ts`
  - Fetch user; throw `NotFoundException` if not found/deleted
  - Throw `ForbiddenException` if not adult
  - Find draft index by `studentDraftId`; throw `NotFoundException` if not found
  - Set `archivedAt` to `new Date()` on the matched draft using array splice +
    `$set` on the full `householdStudentDrafts` array
  - Return the full updated `householdStudentDrafts` array mapped to
    `HouseholdStudentMe[]`
  - _Requirements: 4.3, 4.4, 7.4, 7.5, 7.6_

- [x] 7. Implement `ProfileService.restoreHouseholdStudent`
  - Add `restoreHouseholdStudent(cognitoSub: string, studentDraftId: string)` to
    `nest-app/src/profile/profile.service.ts`
  - Fetch user; throw `NotFoundException` if not found/deleted
  - Throw `ForbiddenException` if not adult
  - Find draft index by `studentDraftId`; throw `NotFoundException` if not found
  - Set `archivedAt` to `null` on the matched draft using array splice + `$set`
    on the full `householdStudentDrafts` array
  - Return the full updated `householdStudentDrafts` array mapped to
    `HouseholdStudentMe[]`
  - _Requirements: 5.2, 5.3, 7.7, 7.8, 7.9_

  - [x] 7.1 Write property test — Property 7: Archive/restore round-trip
    - **Property 7: Archive sets `archivedAt`; restore clears it**
    - Generate a user with N active drafts (N ≥ 1) and pick a random valid index
    - Assert: after `archiveHouseholdStudent`, the targeted draft's `archivedAt`
      is non-null; after `restoreHouseholdStudent`, `archivedAt` is null; array
      length is unchanged throughout
    - **Validates: Requirements 4.4, 5.3**

- [x] 8. Add the three new endpoints to `ProfileController`
  - In `nest-app/src/profile/profile.controller.ts`, add:
    - `@Post('household-students')` handler calling
      `profileService.addHouseholdStudent`; accepts
      `@Body() dto: AddHouseholdStudentDto`; returns
      `{ message: 'Student added', data: { householdStudentDrafts } }`
    - `@Patch('household-students/:studentDraftId/archive')` handler calling
      `profileService.archiveHouseholdStudent`; returns
      `{ message: 'Student archived', data: { householdStudentDrafts } }`
    - `@Patch('household-students/:studentDraftId/restore')` handler calling
      `profileService.restoreHouseholdStudent`; returns
      `{ message: 'Student restored', data: { householdStudentDrafts } }`
  - Add Swagger decorators (`@ApiOperation`, `@ApiBadRequestResponse`,
    `@ApiForbiddenResponse`, `@ApiNotFoundResponse`, `@ApiUnauthorizedResponse`)
    consistent with existing controller style
  - Import `AddHouseholdStudentDto` at the top of the file
  - _Requirements: 7.1, 7.4, 7.7, 7.10_

- [x] 9. Checkpoint — Ensure backend tests pass
  - Run `pnpm test --run` inside `nest-app/` and confirm all tests in
    `profile.service.spec.ts` and `profile.controller.spec.ts` pass
  - Run `tsc -b` inside `nest-app/` to confirm no TypeScript errors
  - Ask the user if any questions arise before continuing

- [x] 10. Extend frontend `HouseholdStudentProfile` type and `ProfileUserData`
  - In `tanstack-router/src/api/services/user.services.ts`:
    - Add `archivedAt?: string | null` to the existing `HouseholdStudentProfile`
      type
    - Add a new `HouseholdStudentDraftAll` type (same shape as
      `HouseholdStudentProfile` — can be a type alias or identical declaration)
    - Add `householdStudentDraftsAll?: HouseholdStudentDraftAll[]` to
      `ProfileUserData`
  - _Requirements: 2.1, 2.2_

- [x] 11. Add API service methods for household student mutations
  - In `tanstack-router/src/api/services/user.services.ts`, add to the
    `UserServices` object:
    - `addHouseholdStudent(json: { displayName: string; currentGrade: number })`:
      `POST profile/household-students`; returns
      `Promise<{ message: string; data: { householdStudentDrafts: HouseholdStudentDraftAll[] } }>`
    - `archiveHouseholdStudent(studentDraftId: string)`:
      `PATCH profile/household-students/:studentDraftId/archive`; returns same
      shape
    - `restoreHouseholdStudent(studentDraftId: string)`:
      `PATCH profile/household-students/:studentDraftId/restore`; returns same
      shape
  - Use `encodeURIComponent(studentDraftId)` in the URL for archive and restore
  - _Requirements: 3.3, 4.3, 5.2_

- [x] 12. Create `useAddHouseholdStudent`, `useArchiveHouseholdStudent`, and
      `useRestoreHouseholdStudent` mutation hooks
  - Create `tanstack-router/src/hooks/use-add-household-student.ts`
    - `useMutation` wrapping `UserServices.addHouseholdStudent`
    - On success: `queryClient.invalidateQueries({ queryKey: ['user', 'me'] })`
  - Create `tanstack-router/src/hooks/use-archive-household-student.ts`
    - `useMutation` wrapping `UserServices.archiveHouseholdStudent`
    - On success: `queryClient.invalidateQueries({ queryKey: ['user', 'me'] })`
  - Create `tanstack-router/src/hooks/use-restore-household-student.ts`
    - `useMutation` wrapping `UserServices.restoreHouseholdStudent`
    - On success: `queryClient.invalidateQueries({ queryKey: ['user', 'me'] })`
  - _Requirements: 3.6, 4.5, 5.4_

- [x] 13. Create `gradeLabel` utility
  - Create `tanstack-router/src/lib/grade-label.ts`
  - Export `gradeLabel(grade: number): string`:
    - `0` → `"Kindergarten"`
    - `1`–`12` → `"Grade ${grade}"`
    - `13` → `"Grade 13 / Post-Secondary"`
    - Any other value → `String(grade)` (defensive fallback)
  - Export `GRADE_OPTIONS`: array of `{ value: number; label: string }` for
    grades 0–13, built using `gradeLabel`
  - _Requirements: 9.1, 9.2_

  - [x] 13.1 Write unit tests for `gradeLabel`
    - Test: `gradeLabel(0)` returns `"Kindergarten"`
    - Test: `gradeLabel(1)` returns `"Grade 1"`
    - Test: `gradeLabel(12)` returns `"Grade 12"`
    - Test: `gradeLabel(13)` returns `"Grade 13 / Post-Secondary"`
    - _Requirements: 9.1_

  - [x] 13.2 Write property test — Property 3: `gradeLabel` round-trip
    - **Property 3: `gradeLabel` produces non-empty labels and round-trips**
    - Generate `fc.integer({ min: 0, max: 13 })`
    - Assert: `gradeLabel(n)` is a non-empty string; `GRADE_OPTIONS` contains
      exactly one entry with `value === n`; the entry's `label` equals
      `gradeLabel(n)`
    - **Validates: Requirement 9.3**

- [x] 14. Create `StudentDraftCard` component
  - Create `tanstack-router/src/components/cards/student-draft-card.tsx`
  - Props:
    ```typescript
    type StudentDraftCardProps = {
      draft: HouseholdStudentDraftAll;
      onArchive?: (studentDraftId: string) => void;
      onRestore?: (studentDraftId: string) => void;
      isArchiving?: boolean;
      isRestoring?: boolean;
    };
    ```
  - Render: `draft.displayName`, `gradeLabel(draft.currentGrade)`,
    `draft.lastPromotionYear`
  - When `draft.archivedAt` is null/absent: render an "Archive" button that
    calls `onArchive(draft.studentDraftId)`; disable when `isArchiving` is true
  - When `draft.archivedAt` is non-null: render a "Restore" button that calls
    `onRestore(draft.studentDraftId)`; disable when `isRestoring` is true
  - Use existing `Card` UI primitive
  - _Requirements: 2.3, 4.1, 4.7, 5.1, 5.6_

  - [x] 14.1 Write unit tests for `StudentDraftCard`
    - Test: renders displayName, grade label, lastPromotionYear
    - Test: active draft shows Archive button, not Restore button
    - Test: archived draft shows Restore button, not Archive button
    - Test: Archive button is disabled when `isArchiving=true`
    - Test: Restore button is disabled when `isRestoring=true`
    - _Requirements: 2.3, 4.1, 5.1_

  - [x] 14.2 Create Storybook and Cypress component tests for `StudentDraftCard`
    - Add `student-draft-card.stories.tsx` and `student-draft-card.cy.tsx`
    - **Reference tests:** `add-course-sheet.stories.tsx` /
      `add-course-sheet.cy.tsx` (patterns for wrapping providers and asserting
      interactive UI)
    - Cover rendering, props (draft variants), and user interactions (Archive /
      Restore) per workspace checklist

- [x] 15. Create `AddStudentSheet` component
  - Create `tanstack-router/src/components/sections/add-student-sheet.tsx`
  - Props:
    ```typescript
    type AddStudentSheetProps = {
      open: boolean;
      onOpenChange: (open: boolean) => void;
    };
    ```
  - Use the existing `Sheet` UI primitive
  - Form fields:
    - `displayName`: text input, required, max 100 characters; show field-level
      error when empty or exceeds limit
    - `currentGrade`: `Select` dropdown populated from `GRADE_OPTIONS` (from
      `grade-label.ts`); required
  - Call `useAddHouseholdStudent` mutation on submit
  - Disable submit button while mutation is pending or form is invalid
  - On success: close sheet (call `onOpenChange(false)`)
  - On error: show inline error message; keep sheet open
  - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.7, 3.8, 9.2_

  - [x] 15.1 Write unit tests for `AddStudentSheet`
    - Test: submit button is disabled when form is empty
    - Test: submit button is disabled when `displayName` exceeds 100 characters
    - Test: grade selector renders all 14 options (Kindergarten through Grade 13
      / Post-Secondary)
    - Test: submit button is disabled while mutation is pending
    - _Requirements: 3.2, 3.5, 3.8_

  - [x] 15.2 Write property test — Property 4: Add-student form rejects invalid
        submissions
    - **Property 4: Add-student form rejects invalid submissions**
    - Generate form state with at least one invalid field: empty `displayName`,
      `displayName` longer than 100 characters, or missing `currentGrade`
    - Assert: submit button is disabled; at least one field-level validation
      error is visible
    - **Validates: Requirement 3.5**

  - [x] 15.3 Create Storybook and Cypress component tests for `AddStudentSheet`
    - Add `add-student-sheet.stories.tsx` and `add-student-sheet.cy.tsx`
    - **Reference tests:** same as task 14.2 (`add-course-sheet.stories.tsx` /
      `add-course-sheet.cy.tsx`)
    - Cover rendering, props, validation, loading (pending mutation), error
      states, and edge cases per workspace checklist

- [x] 16. Create the `ChildAccountsPage` component
  - Create `tanstack-router/src/components/pages/child-accounts.page.tsx`
  - Call `useLoggedInUser()` (query key `['user', 'me']`) to get profile data
    including `householdStudentDraftsAll`
  - Split drafts into `active` (archivedAt null/absent) and `archived`
    (archivedAt non-null) arrays
  - Render states:
    - Loading: skeleton/loading indicator in place of the student list
    - Error: error banner with a retry button; no student list shown
    - Empty (no active drafts): empty-state message in the active section
    - Populated: active section with `StudentDraftCard` per active draft;
      archived section (hidden when empty) with `StudentDraftCard` per archived
      draft
  - Render an "Add Student" button that opens `AddStudentSheet`
  - Archive flow:
    - Track `archivingId` state (which student is being archived)
    - When "Archive" is activated: set `archivingId` and open
      `RemoveConfirmDialog` (reuse existing component with appropriate copy)
    - On confirm: call `useArchiveHouseholdStudent` mutation with
      `studentDraftId`; disable the Archive button for that student while
      in-flight
    - On error: show error message; retain student in active section
    - On cancel: close dialog; no request sent
  - Restore flow:
    - Call `useRestoreHouseholdStudent` mutation directly on "Restore" button
      click (no confirmation required)
    - Disable the Restore button for the student being restored while in-flight
    - On error: show error message; retain student in archived section
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.6, 3.9, 4.1, 4.2,
    4.3, 4.5, 4.6, 4.7, 5.1, 5.2, 5.4, 5.5, 5.6_

  - [x] 16.1 Write unit tests for `ChildAccountsPage`
    - Test: shows loading skeleton while data is loading
    - Test: shows empty-state message when there are no active drafts
    - Test: shows error banner with retry when profile fetch fails
    - Test: renders one `StudentDraftCard` per active draft in the active
      section
    - Test: renders one `StudentDraftCard` per archived draft in the archived
      section
    - Test: hides the archived section entirely when there are no archived
      drafts
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.7_

  - [x] 16.2 Write property test — Property 1: Student list renders all drafts
    - **Property 1: Student list renders all drafts**
    - Generate
      `fc.array(arbitraryHouseholdStudentDraftAll(), { minLength: 1, maxLength: 20 })`
    - Assert: rendered output contains exactly `drafts.length` student cards
      with no omissions or duplicates across both sections
    - **Validates: Requirement 2.1**

  - [x] 16.3 Write property test — Property 2: Active/archived split is correct
    - **Property 2: Active/archived split is correct**
    - Generate
      `fc.array(arbitraryHouseholdStudentDraftAll(), { minLength: 0, maxLength: 20 })`
    - Assert: active section card count equals count of drafts with `archivedAt`
      null/absent; archived section card count equals count of drafts with
      non-null `archivedAt`; no draft appears in both sections
    - **Validates: Requirement 2.2**

- [x] 17. Checkpoint — Ensure all component tests pass
  - Run `pnpm test --run` inside `tanstack-router/` and confirm all tests for
    `gradeLabel`, `StudentDraftCard`, `AddStudentSheet`, and `ChildAccountsPage`
    pass
  - Run `tsc -b` inside `tanstack-router/` to confirm no TypeScript errors
  - Ask the user if any questions arise before continuing

- [x] 18. Create the route file `_private.settings.child-accounts.tsx`
  - Create
    `tanstack-router/src/routes/(private)/_private.settings.child-accounts.tsx`
  - Define route with
    `createFileRoute('/(private)/_private/settings/child-accounts')`
  - `beforeLoad`: call `UserServices.getUser()`; if
    `accountType !== 'adult' || ageBandAtRegistration !== 'ADULT_18_PLUS'`,
    throw `redirect({ to: '/settings/profile' })`; re-throw redirects; swallow
    other fetch errors (let the page component handle them)
  - `head`: return `{ meta: [{ title: 'Child Accounts | Settings' }] }`
  - `component`: `ChildAccountsPage`
  - _Requirements: 1.1, 1.2, 1.3, 1.6_

  - [x] 18.1 Write unit tests for route `beforeLoad`
    - Test: redirects non-adult user to `/settings/profile`
    - Test: allows adult user (`accountType === 'adult'`,
      `ageBandAtRegistration === 'ADULT_18_PLUS'`) through without redirect
    - _Requirements: 1.2_

- [x] 19. Add "Child Accounts" link to `SettingsShellSidebar`
  - Edit `tanstack-router/src/components/settings-shell-sidebar.tsx`
  - Import `Users` from `lucide-react` (add to the existing import)
  - Add to `settingsNav` array after the `Teaching Subjects` entry:
    `{ to: '/settings/child-accounts', label: 'Child Accounts', icon: Users }`
  - The existing `isActive` logic already handles the active state for the new
    entry
  - _Requirements: 1.4, 1.5_

- [x] 19.1 Verify Student_Selector / student context (no code change expected)
  - Confirm `householdStudents` from `['user', 'me']` remains the only source
    for the sidebar list (e.g. `student-context.tsx`)
  - After backend filters archived drafts out of `householdStudents`, confirm
    archive/restore still updates the selector via query invalidation
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 20. Checkpoint — Ensure all tests pass and route tree is valid
  - Run `pnpm test --run` inside `tanstack-router/` and confirm all tests pass
  - Run `tsc -b` inside `tanstack-router/` to confirm no TypeScript errors
  - Verify the TanStack Router route tree regenerates correctly; confirm
    `_private.settings.child-accounts.tsx` appears in `routeTree.gen.ts`
  - Ask the user if any questions arise before marking complete

## Notes

- **Compliance checklist (workspace):** When marking UI/form work complete, cite
  test paths for Storybook/Cypress (tasks 14.2, 15.3) and Vitest (tasks 13.1–13.2,
  14.1, 15.1–15.2, 16.1–16.3, 18.1); reference test is **`add-course-sheet`** as
  listed in those tasks.
- Property tests are tagged with a comment in the format:
  `// Feature: child-accounts-settings, Property N: <property text>`
- The `archivedAt` schema change is backward-compatible: existing documents
  without the field will have `archivedAt` treated as `null` (absent = active),
  so no migration is required
- `crypto.randomUUID()` is available in Node.js 14.17+ without any additional
  package; no `uuid` dependency needed
- The `['user', 'me']` React Query key is the canonical profile cache key; all
  three mutation hooks invalidate it on success, keeping both the settings page
  and the sidebar student selector in sync
- The `beforeLoad` adult check mirrors the pattern in
  `_private.settings.teaching-subjects.tsx`; unauthenticated users are already
  redirected by the parent `_private.tsx` guard
- `RemoveConfirmDialog` is reused for the archive confirmation; the dialog copy
  should be updated to say "Archive Student" / "Are you sure you want to archive
  this student?" rather than the course-removal copy — pass appropriate props or
  extend the component to accept a `title` and `description` prop if needed
- The `householdStudents` field in `GET /profile` is unchanged in shape (still
  active-only); the only change is that the filter is now explicit (previously
  there was no `archivedAt` to filter on)
