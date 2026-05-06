# Implementation Plan: Manage Teachable Subjects

## Overview

Implement the Teaching Subjects settings page at `/settings/teaching-subjects`
where adult users can view, add, and remove their teachable course offerings.
The work spans two layers: a NestJS backend (two new endpoints + `getMe`
extension) and a TanStack Router frontend (new route, page component, four
sub-components, sidebar link, API service methods, and mutation hooks). All
property-based tests use `fast-check` (already installed) with a minimum of 100
iterations per property.

## Tasks

- [x] 1. Extend the backend User schema and `TeachableCourse` subdocument
  - Enable `_id: true` on `TeachableCourse` in
    `nest-app/src/users/schemas/teachable-course.schema.ts` so each embedded
    course gets a stable ObjectId (required for enrollment-count lookup)
  - Add a `notificationEvents` array field to the `User` schema in
    `nest-app/src/users/entities/user.schema.ts` using an inline subdocument
    schema with fields: `type` (`'COURSE_REMOVED'`), `recipientUserId` (string),
    `payload` (mixed), `createdAt` (Date)
  - _Requirements: 7.7, 8.2_

- [x] 2. Create `AddTeachableCourseDto` and backend validation
  - Create `nest-app/src/profile/dto/add-teachable-course.dto.ts`
  - Reuse `TeachableCourseGradesConstraint` from `account-setup.dto.ts`
  - Fields: `className` (string, 1–256 chars), `subjectId` (MongoId),
    `matchesAllGrades` (boolean), `grades` (array validated by
    `TeachableCourseGradesConstraint`), `curriculum` (`HomeschoolCurriculum`
    enum), `maxStudents` (integer, 1–20)
  - _Requirements: 7.1, 7.2_

  - [x] 2.1 Write property test — Property 10: PATCH rejects invalid payloads
    - **Property 10: PATCH endpoint rejects invalid payloads**
    - Generate invalid `AddTeachableCourseDto` variants: missing required
      fields, invalid enum values, `maxStudents` outside 1–20
    - Assert: `ProfileService.addTeachableCourse` throws `BadRequestException`
    - **Validates: Requirements 7.2**

- [x] 3. Implement `ProfileService.addTeachableCourse`
  - Add `addTeachableCourse(cognitoSub: string, dto: AddTeachableCourseDto)` to
    `nest-app/src/profile/profile.service.ts`
  - Fetch user by `cognitoSub`; throw `ForbiddenException` if
    `accountType !== 'adult'` or `ageBandAtRegistration !== 'adult_18_plus'`
  - Use `$push: { teachableCourses: newCourse }` via
    `UsersService.updateByCognitoSub` to append the course atomically
  - Return the updated `teachableCourses` array with `activeEnrollmentCount`
    computed per course (see Task 5 for the count logic)
  - _Requirements: 7.1, 7.3, 7.8_

  - [x] 3.1 Write property test — Property 9: PATCH appends course (round-trip)
    - **Property 9: PATCH endpoint appends course (round-trip)**
    - Generate `arbitraryAddTeachableCourseDto()` with valid field values
    - Assert: returned array length = original length + 1; last element matches
      input DTO fields
    - **Validates: Requirements 7.1, 7.8**

- [x] 4. Implement `ProfileService.removeTeachableCourse`
  - Add `removeTeachableCourse(cognitoSub: string, index: number)` to
    `nest-app/src/profile/profile.service.ts`
  - Fetch user; throw `ForbiddenException` if not adult
  - Throw `BadRequestException` if `index` is negative, non-integer, or ≥
    `teachableCourses.length`
  - Detect active enrollments: count linked students whose `addedClasses`
    contain an entry where `adult === user._id` and `course` matches the `_id`
    of `teachableCourses[index]`
  - If active enrollments exist, record one `NotificationEvent` per affected
    parent in `user.notificationEvents` before removing the course
  - Remove the course using array splice + `$set` on the full array (or MongoDB
    `$unset` + `$pull` pattern)
  - Return the updated `teachableCourses` array with `activeEnrollmentCount` per
    course
  - _Requirements: 7.4, 7.5, 7.6, 7.7, 7.8_

  - [x] 4.1 Write property test — Property 11: DELETE removes course at index
    - **Property 11: DELETE endpoint removes course at index (round-trip)**
    - Generate `fc.array(arbitraryTeachableCourse(), { minLength: 1 })` and a
      valid zero-based index
    - Assert: returned array length = original − 1; course originally at that
      index is absent
    - **Validates: Requirements 7.4, 7.8**

  - [x] 4.2 Write property test — Property 12: DELETE rejects invalid indices
    - **Property 12: DELETE endpoint rejects invalid indices**
    - Generate negative integers, non-integers, and indices ≥ array length
    - Assert: service throws `BadRequestException`
    - **Validates: Requirements 7.5**

  - [x] 4.3 Write property test — Property 13: DELETE produces correct
        notification event count
    - **Property 13: DELETE with active enrollments produces notification
      events**
    - Generate `fc.integer({ min: 1, max: 20 })` as enrollment count M
    - Assert: `notificationEvents` array length equals M after DELETE
    - **Validates: Requirements 7.7**

- [x] 5. Extend `ProfileService.getMe` to include `activeEnrollmentCount`
  - In `nest-app/src/profile/profile.service.ts`, update `getMe` to compute
    `activeEnrollmentCount` for each `teachableCourse` when the user is an adult
  - For each course at index i, count linked students whose `addedClasses`
    contain an entry where `adult === user._id` AND `course` matches
    `teachableCourses[i]._id`
  - Populate `linkedStudents` with their `addedClasses` before counting (use
    `UsersService` or a direct Mongoose populate call)
  - Include `teachableCourses` (with `activeEnrollmentCount`) in the `getMe`
    response for adult users
  - Update `GetMeData` interface to include
    `teachableCourses?: TeachableCourseResponseItem[]`
  - _Requirements: 8.1, 8.2_

  - [x] 5.1 Write property test — Property 14: GET /profile includes
        `activeEnrollmentCount` per course
    - **Property 14: GET /profile includes activeEnrollmentCount for every
      course**
    - Generate adult user with random `teachableCourses` array and random linked
      student enrollment data
    - Assert: `response.teachableCourses[i].activeEnrollmentCount` equals the
      actual count of matching `addedClasses` entries for each i
    - **Validates: Requirements 8.2**

- [x] 6. Add `PATCH /profile/teachable-courses` and
     `DELETE /profile/teachable-courses/:index` to `ProfileController`
  - In `nest-app/src/profile/profile.controller.ts`, add:
    - `@Patch('teachable-courses')` handler calling
      `profileService.addTeachableCourse`; accepts
      `@Body() dto: AddTeachableCourseDto`
    - `@Delete('teachable-courses/:index')` handler calling
      `profileService.removeTeachableCourse`; parses `:index` as integer via
      `parseInt`
  - Both handlers return
    `{ message, data: { teachableCourses: TeachableCourseResponseItem[] } }`
  - Add Swagger decorators (`@ApiOperation`, `@ApiBadRequestResponse`,
    `@ApiForbiddenResponse`, `@ApiUnauthorizedResponse`) consistent with
    existing controller style
  - _Requirements: 7.1, 7.4_

- [x] 7. Checkpoint — Ensure backend tests pass
  - Run `pnpm test --run` inside `nest-app/` and confirm all tests in
    `profile.service.spec.ts` and `profile.controller.spec.ts` pass
  - Fix any TypeScript errors surfaced by `tsc -b` inside `nest-app/`
  - Ask the user if any questions arise before continuing

- [x] 8. Extend frontend `ProfileUserData` type and `UserServices`
  - In `tanstack-router/src/api/services/user.services.ts`:
    - Add `TeachableCourseWithEnrollment` type:
      `{ className: string; subjectId: string; matchesAllGrades: boolean; grades: string[]; curriculum: string; maxStudents: number; activeEnrollmentCount: number }`
    - Add `teachableCourses?: TeachableCourseWithEnrollment[]` to
      `ProfileUserData`
    - Add `addTeachableCourse` method: `PATCH profile/teachable-courses`
    - Add `removeTeachableCourse` method:
      `DELETE profile/teachable-courses/:index`
    - Both methods return
      `Promise<{ message: string; data: { teachableCourses: TeachableCourseWithEnrollment[] } }>`
  - _Requirements: 3.2, 4.3_

- [x] 9. Create `useAddTeachableCourse` and `useRemoveTeachableCourse` mutation
     hooks
  - Create `tanstack-router/src/hooks/use-add-teachable-course.ts`
    - `useMutation` wrapping `UserServices.addTeachableCourse`
    - On success: `queryClient.invalidateQueries({ queryKey: ['user', 'me'] })`
  - Create `tanstack-router/src/hooks/use-remove-teachable-course.ts`
    - `useMutation` wrapping `UserServices.removeTeachableCourse`
    - On success: `queryClient.invalidateQueries({ queryKey: ['user', 'me'] })`
  - _Requirements: 3.8, 4.4_

- [x] 10. Create `CourseCard` component
  - Create `tanstack-router/src/components/cards/course-card.tsx`
  - Props: `course: TeachableCourseWithEnrollment`, `index: number`,
    `subjects: Subject[]`, `onRemove: (index: number) => void`,
    `isRemoving: boolean`
  - Render: resolved subject name (look up by `course.subjectId` in `subjects`),
    `course.className`, grade display
    (`course.matchesAllGrades ? 'All grades' : course.grades.join(', ')`),
    curriculum label, `course.maxStudents`
  - Render a "Remove" button that calls `onRemove(index)`; disable it when
    `isRemoving` is true
  - Do NOT render any edit control
  - Include a contextual note: "To change this course, remove it and add a new
    one."
  - _Requirements: 2.3, 4.1, 4.6, 6.1, 6.2_

  - [x] 10.1 Write unit tests for `CourseCard`
    - Test: renders subject name, className, grade display, curriculum,
      maxStudents
    - Test: Remove button is present; no edit button present
    - Test: Remove button is disabled when `isRemoving=true`
    - Test: contextual note text is rendered
    - _Requirements: 2.3, 4.1, 6.1, 6.2_

  - [x] 10.2 Write property test — Property 2: Course card displays all required
        fields
    - **Property 2: Course card displays all required fields**
    - Generate `arbitraryTeachableCourseWithEnrollment()` and
      `arbitrarySubject()`
    - Assert: rendered card contains subject name, className, grade display,
      curriculum label, and maxStudents value
    - **Validates: Requirements 2.3**

  - [x] 10.3 Write property test — Property 6: Every course card has Remove and
        no Edit
    - **Property 6: Every course card has a Remove action and no Edit action**
    - Generate
      `fc.array(arbitraryTeachableCourseWithEnrollment(), { minLength: 0, maxLength: 20 })`
    - Assert: Remove button count equals course count; edit button count equals
      0
    - **Validates: Requirements 4.1, 6.1**

- [x] 11. Create `RemoveConfirmDialog` component
  - Create `tanstack-router/src/components/modals/remove-confirm-dialog.tsx`
  - Props: `open: boolean`, `onConfirm: () => void`, `onCancel: () => void`,
    `isPending: boolean`
  - Standard confirmation dialog using the existing `Dialog` UI primitive
  - Confirm button disabled when `isPending` is true
  - _Requirements: 4.2_

  - [x] 11.1 Write unit tests for `RemoveConfirmDialog`
    - Test: renders and calls `onConfirm` / `onCancel` correctly
    - Test: confirm button disabled when `isPending=true`
    - _Requirements: 4.2_

- [x] 12. Create `RemoveWarningDialog` component
  - Create `tanstack-router/src/components/modals/remove-warning-dialog.tsx`
  - Props: `open: boolean`, `enrollmentCount: number`, `onConfirm: () => void`,
    `onCancel: () => void`, `isPending: boolean`
  - Display the enrollment count and explain that parents will be notified that
    the class is no longer available
  - Confirm button disabled when `isPending` is true
  - _Requirements: 5.1, 5.2, 5.3_

  - [x] 12.1 Write unit tests for `RemoveWarningDialog`
    - Test: displays enrollment count in dialog text
    - Test: renders notification warning text about parents being notified
    - Test: calls `onConfirm` / `onCancel` correctly
    - _Requirements: 5.2, 5.3_

  - [x] 12.2 Write property test — Property 8: Warning dialog displays correct
        enrollment count
    - **Property 8: Warning dialog displays the correct enrollment count**
    - Generate `fc.integer({ min: 1, max: 100 })` as `enrollmentCount`
    - Assert: dialog text contains the exact count value N
    - **Validates: Requirements 5.3**

- [x] 13. Create `AddCourseSheet` component
  - Create `tanstack-router/src/components/sections/add-course-sheet.tsx`
  - Props: `open: boolean`, `onOpenChange: (open: boolean) => void`,
    `subjects: Subject[]`
  - Use the existing `Sheet` UI primitive
  - Form fields: subject selector (dropdown from `subjects`), class name (text
    input), grade selector (multi-select filtered by
    `homeschoolGradeOptionsWithinSpanLimit`), curriculum selector (enum
    dropdown), max students (number input, 1–20)
  - Validation: use `rowIsComplete`, `gradesSelectionIsValid`,
    `rowGradeSpanViolationMessage`, and `reconcileGradesAfterMultiSelect` from
    `teachable-course-validation.ts`
  - When selected subject has `isEnrichment === true`: offer "All grades"
    option; do not require specific grades
  - When selected subject has `isEnrichment === false`: require at least one
    specific grade; hide "All grades" option; enforce consecutive-grade-span
    limit
  - Disable submit button while mutation is pending or form is invalid
  - On success: close sheet; profile query is invalidated by the mutation hook
  - On error: show inline error message; keep sheet open
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

  - [x] 13.1 Write unit tests for `AddCourseSheet`
    - Test: submit disabled when form is empty
    - Test: submit disabled when grade span is violated
    - Test: enrichment subject shows "All grades" option
    - Test: non-enrichment subject hides "All grades" option
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 13.2 Write property test — Property 3: Add-course form rejects
        incomplete submissions
    - **Property 3: Add-course form rejects incomplete submissions**
    - Generate form state with at least one required field missing or invalid
    - Assert: submit button is disabled; at least one field-level validation
      error is visible
    - **Validates: Requirements 3.3, 3.7**

  - [x] 13.3 Write property test — Property 4: Enrichment subjects allow "All
        grades"; non-enrichment subjects do not
    - **Property 4: Enrichment/non-enrichment grade options**
    - Generate `arbitrarySubject()` with `isEnrichment` as a boolean
    - Assert: "All grades" option presence matches `isEnrichment`
    - **Validates: Requirements 3.4, 3.5**

  - [x] 13.4 Write property test — Property 5: Grade-span limit enforced for
        non-enrichment subjects
    - **Property 5: Grade-span limit is enforced for non-enrichment subjects**
    - Generate non-enrichment subject + grade selection exceeding
      `getMaxConsecutiveGradesForSubject`
    - Assert: `rowGradeSpanViolationMessage` returns non-null; form submit is
      disabled
    - **Validates: Requirements 3.6**

- [x] 14. Checkpoint — Ensure all component tests pass
  - Run `pnpm test --run` inside `tanstack-router/` and confirm all tests for
    `CourseCard`, `RemoveConfirmDialog`, `RemoveWarningDialog`, and
    `AddCourseSheet` pass
  - Fix any TypeScript errors surfaced by `tsc -b` inside `tanstack-router/`
  - Ask the user if any questions arise before continuing

- [x] 15. Create the `TeachingSubjectsPage` component
  - Create `tanstack-router/src/components/pages/teaching-subjects.page.tsx`
  - Call `useLoggedInUser()` (query key `['user', 'me']`) to get profile data
    including `teachableCourses` with `activeEnrollmentCount`
  - Call `useSubjects()` to get the subject catalog for name resolution
  - Render states:
    - Loading: skeleton/loading indicator in place of the course list
    - Error: error banner with a retry button; no course list shown
    - Empty: empty-state message indicating no teaching subjects added yet
    - Populated: list of `CourseCard` components, one per course
  - Render an "Add Subject" button that opens `AddCourseSheet`
  - Removal flow:
    - Track `removingIndex` state (which course is being removed)
    - When "Remove" is activated: if `activeEnrollmentCount === 0` open
      `RemoveConfirmDialog`; if `activeEnrollmentCount > 0` open
      `RemoveWarningDialog`
    - On confirm: call `useRemoveTeachableCourse` mutation with the course
      index; disable the Remove button for that course while in-flight
    - On error: show error toast/message; retain course in list
    - On cancel: close dialog; no request sent
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1,
    5.2, 5.3, 5.4, 5.5, 5.6, 6.2, 8.3, 8.4_

  - [x] 15.1 Write unit tests for `TeachingSubjectsPage`
    - Test: shows loading skeleton while data is loading
    - Test: shows empty state when `teachableCourses` is empty
    - Test: shows error banner with retry when profile fetch fails
    - Test: renders one `CourseCard` per course in the list
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [x] 15.2 Write property test — Property 1: Course list renders all courses
    - **Property 1: Course list renders all courses**
    - Generate
      `fc.array(arbitraryTeachableCourseWithEnrollment(), { minLength: 1, maxLength: 20 })`
    - Assert: rendered output contains exactly `courses.length` course cards
      with no omissions or duplicates
    - **Validates: Requirements 2.1**

  - [x] 15.3 Write property test — Property 7: Warning dialog shown for courses
        with active enrollments
    - **Property 7: Warning dialog is shown for courses with active
      enrollments**
    - Generate `arbitraryTeachableCourseWithEnrollment()` with
      `activeEnrollmentCount > 0`
    - Assert: clicking Remove opens `RemoveWarningDialog`, not
      `RemoveConfirmDialog`
    - **Validates: Requirements 5.1, 8.3**

- [x] 16. Create the route file `_private.settings.teaching-subjects.tsx`
  - Create
    `tanstack-router/src/routes/(private)/_private.settings.teaching-subjects.tsx`
  - Define route with
    `createFileRoute('/(private)/_private/settings/teaching-subjects')`
  - `beforeLoad`: read profile from React Query cache (query key
    `['user', 'me']`) or fetch it; if `accountType !== 'adult'` or
    `ageBandAtRegistration !== 'adult_18_plus'`, throw
    `redirect({ to: '/settings/profile' })`; unauthenticated users are already
    handled by the parent `_private.tsx` guard
  - `head`: return `{ meta: [{ title: 'Teaching Subjects | Settings' }] }`
  - `component`: `TeachingSubjectsPage`
  - _Requirements: 1.1, 1.2, 1.3, 1.6_

  - [x] 16.1 Write unit tests for route `beforeLoad`
    - Test: redirects non-adult user to `/settings/profile`
    - Test: allows adult user through without redirect
    - _Requirements: 1.2_

- [x] 17. Add "Teaching Subjects" link to `SettingsShellSidebar`
  - Edit `tanstack-router/src/components/settings-shell-sidebar.tsx`
  - Import `BookOpen` from `lucide-react`
  - Add to `settingsNav` array:
    `{ to: '/settings/teaching-subjects', label: 'Teaching Subjects', icon: BookOpen }`
  - The existing `isActive` logic
    (`pathname === to || pathname.startsWith(...)`) already handles the active
    state for the new entry
  - _Requirements: 1.4, 1.5_

- [x] 18. Checkpoint — Ensure all tests pass and route tree is valid
  - Run `pnpm test --run` inside `tanstack-router/` and confirm all tests pass
  - Run `tsc -b` inside `tanstack-router/` to confirm no TypeScript errors
  - Verify the TanStack Router route tree regenerates correctly (the plugin runs
    on build/dev start); confirm `_private.settings.teaching-subjects.tsx`
    appears in `routeTree.gen.ts`
  - Ask the user if any questions arise before marking complete

## Notes

- Sub-tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests are tagged with a comment in the format:
  `// Feature: manage-teachable-subjects, Property N: <property text>`
- The `TeachableCourse` schema change (enabling `_id`) is a prerequisite for
  enrollment-count lookups; complete Task 1 before Tasks 3–5
- The `['user', 'me']` React Query key is the canonical profile cache key used
  throughout the frontend; both mutation hooks invalidate it on success
- The `beforeLoad` adult check mirrors the pattern used in other private routes;
  unauthenticated users are already redirected by the parent `_private.tsx`
  guard
- The notification stub (Task 4) records events in `user.notificationEvents`; no
  delivery mechanism is wired yet — this establishes the contract for a future
  notification service
- Property tests for the backend (Tasks 2–5) use `@fast-check/jest` or a custom
  fast-check integration with Jest; frontend property tests (Tasks 10–15) use
  `fast-check` with Vitest
