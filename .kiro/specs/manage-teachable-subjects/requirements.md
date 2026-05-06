# Requirements Document

## Introduction

This feature adds a "Teaching Subjects" page to the account settings area of the
TanStack Router frontend. Adult users can view the list of subjects they are
willing to teach, add new subject offerings, and remove existing ones. Because
enrolled students may reference a teachable course, in-place editing is not
permitted — users must remove an entry and add a new one. When a removal would
affect students who are actively enrolled in that course, the UI warns the adult
and notifies affected parents upon confirmation.

The page lives at `/settings/teaching-subjects` and is accessible only to
authenticated adult users. The settings shell route structure supports nested
settings pages so that this route is reachable within the settings layout.

---

## Glossary

- **Adult_User**: An authenticated user whose `accountType` is `adult` and whose
  `ageBandAtRegistration` is `adult_18_plus`.
- **Teachable_Course**: An embedded document on the adult user record containing
  `className`, `subjectId` (reference to a Subject), `grades` (array of
  `HomeschoolGrade` values), `matchesAllGrades` (boolean), `curriculum`
  (`HomeschoolCurriculum` enum), and `maxStudents` (1–20).
- **Subject**: A catalog entry returned by `GET /subjects`, containing `_id`,
  `name`, `slug`, `icon`, `color`, and `isEnrichment`.
- **Enrolled_Class**: An entry in a student's `addedClasses` array that
  references an adult user and a `TeachableCourse`.
- **Active_Enrollment**: An `Enrolled_Class` record on any linked student that
  references the `Teachable_Course` being removed.
- **Teaching_Subjects_Page**: The settings sub-page at
  `/settings/teaching-subjects` that this feature introduces.
- **Settings_Shell**: The shared settings layout component
  (`_private.settings.tsx`) that renders the sidebar and an `<Outlet />` for
  nested settings routes.
- **Removal_Warning_Dialog**: A modal dialog shown before a removal is committed
  when one or more Active_Enrollments exist for the course being removed.
- **Profile_API**: The NestJS backend controller at `/profile` that manages user
  data.
- **Subjects_API**: The unauthenticated backend endpoint at `/subjects` that
  returns the Subject catalog.

---

## Requirements

### Requirement 1: Page Access and Route Setup

**User Story:** As an Adult_User, I want a dedicated settings page for managing
my teaching subjects, so that I can find and update my offerings without leaving
the settings area.

#### Acceptance Criteria

1. WHEN an Adult_User navigates to `/settings/teaching-subjects`, THE
   Settings_Shell SHALL render the Teaching_Subjects_Page within the settings
   sidebar layout.
2. WHEN a non-adult authenticated user navigates to
   `/settings/teaching-subjects`, THE Teaching_Subjects_Page SHALL redirect the
   user to `/settings/profile`.
3. WHEN an unauthenticated user navigates to `/settings/teaching-subjects`, THE
   Teaching_Subjects_Page SHALL redirect the user to the login route, consistent
   with the existing private route guard behavior.
4. THE Settings_Shell_Sidebar SHALL include a navigation link labelled "Teaching
   Subjects" that routes to `/settings/teaching-subjects`.
5. WHEN the user is on the `/settings/teaching-subjects` path, THE
   Settings_Shell_Sidebar SHALL render the "Teaching Subjects" link in its
   active state.
6. THE Teaching_Subjects_Page SHALL set a `<title>` meta tag with the value
   `Teaching Subjects | Settings`.

---

### Requirement 2: Display Existing Teachable Courses

**User Story:** As an Adult_User, I want to see all the subjects I have listed
as teachable, so that I know what is currently visible to families searching for
tutors.

#### Acceptance Criteria

1. WHEN the Teaching_Subjects_Page loads, THE Teaching_Subjects_Page SHALL fetch
   the authenticated user's profile from the Profile_API and display each entry
   in `teachableCourses` as a distinct card or row.
2. WHEN the user's `teachableCourses` array is empty, THE Teaching_Subjects_Page
   SHALL display an empty-state message indicating that no teaching subjects
   have been added yet.
3. THE Teaching_Subjects_Page SHALL display the following fields for each
   Teachable_Course: resolved subject name (from the Subjects_API), `className`,
   grade range or "All grades", curriculum label, and `maxStudents`.
4. WHILE the profile data is loading, THE Teaching_Subjects_Page SHALL display a
   loading indicator in place of the course list.
5. IF the Profile_API returns an error, THEN THE Teaching_Subjects_Page SHALL
   display an error message and a retry action.

---

### Requirement 3: Add a New Teachable Course

**User Story:** As an Adult_User, I want to add a new subject offering to my
profile, so that students can find and enroll in my classes.

#### Acceptance Criteria

1. THE Teaching_Subjects_Page SHALL provide an "Add Subject" control that opens
   an add-course form or panel.
2. WHEN the Adult_User submits the add-course form, THE Teaching_Subjects_Page
   SHALL send a `PATCH /profile/teachable-courses` request to the Profile_API
   with the new course data appended to the existing list.
3. THE add-course form SHALL require the following fields: subject (selected
   from the Subjects_API catalog), class name, at least one grade level or the
   "All grades" option for enrichment subjects, curriculum, and maximum students
   (1–20).
4. WHEN the selected subject has `isEnrichment` equal to `true`, THE add-course
   form SHALL offer an "All grades" option in the grade selector and SHALL NOT
   require specific grade levels.
5. WHEN the selected subject has `isEnrichment` equal to `false`, THE add-course
   form SHALL require at least one specific grade level and SHALL NOT allow the
   "All grades" option.
6. WHEN the selected subject has `isEnrichment` equal to `false`, THE add-course
   form SHALL enforce the consecutive-grade-span limit defined in
   `teachable-course-validation.ts` for that subject's slug.
7. IF the add-course form is submitted with any required field missing or
   invalid, THEN THE add-course form SHALL display a field-level validation
   error and SHALL NOT submit the request.
8. WHEN the Profile_API returns a success response, THE Teaching_Subjects_Page
   SHALL update the displayed course list without a full page reload and SHALL
   close the add-course form.
9. IF the Profile_API returns an error on add, THEN THE add-course form SHALL
   display an error message and SHALL remain open so the user can retry.
10. WHILE the add-course submission is in progress, THE add-course form SHALL
    disable the submit button to prevent duplicate submissions.

---

### Requirement 4: Remove a Teachable Course (No Active Enrollments)

**User Story:** As an Adult_User, I want to remove a subject I no longer wish to
teach, so that it no longer appears in search results.

#### Acceptance Criteria

1. THE Teaching_Subjects_Page SHALL display a "Remove" action for each
   Teachable_Course in the list.
2. WHEN the Adult_User activates the "Remove" action for a Teachable_Course that
   has no Active_Enrollments, THE Teaching_Subjects_Page SHALL display a
   confirmation prompt before sending the removal request.
3. WHEN the Adult_User confirms the removal, THE Teaching_Subjects_Page SHALL
   send a `DELETE /profile/teachable-courses/:index` request to the Profile_API
   identifying the course to remove.
4. WHEN the Profile_API returns a success response, THE Teaching_Subjects_Page
   SHALL remove the course from the displayed list without a full page reload.
5. IF the Profile_API returns an error on removal, THEN THE
   Teaching_Subjects_Page SHALL display an error message and SHALL retain the
   course in the displayed list.
6. WHILE the removal request is in progress, THE Teaching_Subjects_Page SHALL
   disable the "Remove" action for the course being removed to prevent duplicate
   requests.

---

### Requirement 5: Remove a Teachable Course with Active Enrollments (Warning Flow)

**User Story:** As an Adult_User, I want to be warned before removing a subject
that has enrolled students, so that I understand the impact on those families
before I proceed.

#### Acceptance Criteria

1. WHEN the Adult_User activates the "Remove" action for a Teachable_Course that
   has one or more Active_Enrollments, THE Teaching_Subjects_Page SHALL display
   the Removal_Warning_Dialog before sending any removal request.
2. THE Removal_Warning_Dialog SHALL state that removing the course will notify
   the parents of affected enrolled students that the class is no longer
   available.
3. THE Removal_Warning_Dialog SHALL display the count of affected enrolled
   students.
4. WHEN the Adult_User confirms removal in the Removal_Warning_Dialog, THE
   Teaching_Subjects_Page SHALL send the removal request to the Profile_API,
   which SHALL trigger parent notifications for each affected enrollment.
5. WHEN the Adult_User cancels the Removal_Warning_Dialog, THE
   Teaching_Subjects_Page SHALL close the dialog and SHALL NOT send any removal
   request.
6. IF the Profile_API returns an error after the Adult_User confirmed removal in
   the Removal_Warning_Dialog, THEN THE Teaching_Subjects_Page SHALL display an
   error message and SHALL retain the course in the displayed list.

---

### Requirement 6: No In-Place Editing

**User Story:** As an Adult_User, I want the system to prevent me from editing
an existing course entry directly, so that existing student enrollment records
are not silently corrupted.

#### Acceptance Criteria

1. THE Teaching_Subjects_Page SHALL NOT provide an inline edit control for any
   existing Teachable_Course entry.
2. THE Teaching_Subjects_Page SHALL display a contextual note explaining that to
   change a course offering the user must remove the existing entry and add a
   new one.

---

### Requirement 7: Backend — Teachable Courses Mutation Endpoints

**User Story:** As a developer, I want dedicated API endpoints for adding and
removing teachable courses, so that the frontend can manage them without
replacing the entire user document.

#### Acceptance Criteria

1. THE Profile_API SHALL expose a `PATCH /profile/teachable-courses` endpoint
   that appends a single validated Teachable_Course to the authenticated adult
   user's `teachableCourses` array.
2. WHEN the `PATCH /profile/teachable-courses` request body fails validation
   (missing required fields, invalid enum values, grade-span violation, or
   `maxStudents` outside 1–20), THEN THE Profile_API SHALL return HTTP 400 with
   a descriptive error message.
3. WHEN the authenticated user is not an Adult_User, THEN THE Profile_API SHALL
   return HTTP 403 for `PATCH /profile/teachable-courses`.
4. THE Profile_API SHALL expose a `DELETE /profile/teachable-courses/:index`
   endpoint that removes the Teachable_Course at the given zero-based index from
   the authenticated adult user's `teachableCourses` array.
5. WHEN the `:index` parameter is out of range or not a non-negative integer,
   THEN THE Profile_API SHALL return HTTP 400.
6. WHEN the authenticated user is not an Adult_User, THEN THE Profile_API SHALL
   return HTTP 403 for `DELETE /profile/teachable-courses/:index`.
7. WHEN a `DELETE /profile/teachable-courses/:index` request targets a
   Teachable_Course that has one or more Active_Enrollments, THE Profile_API
   SHALL remove the course AND record a notification event for each affected
   parent so that parents are informed the class is no longer available.
8. THE Profile_API SHALL return HTTP 200 with the updated `teachableCourses`
   array on successful `PATCH` and `DELETE` operations.

---

### Requirement 8: Active Enrollment Detection

**User Story:** As a developer, I want the system to reliably detect whether a
teachable course has active enrolled students, so that the warning flow is
triggered correctly.

#### Acceptance Criteria

1. WHEN the Teaching_Subjects_Page loads the course list, THE
   Teaching_Subjects_Page SHALL fetch enrollment status for each
   Teachable_Course from the Profile_API so that the UI knows which courses have
   Active_Enrollments.
2. THE Profile_API SHALL include an `activeEnrollmentCount` field for each
   Teachable_Course in the `GET /profile` response, representing the number of
   linked students whose `addedClasses` reference that course.
3. WHEN `activeEnrollmentCount` is greater than zero for a Teachable_Course, THE
   Teaching_Subjects_Page SHALL treat that course as having Active_Enrollments
   and SHALL trigger the Removal_Warning_Dialog flow on removal.
4. WHEN `activeEnrollmentCount` is zero for a Teachable_Course, THE
   Teaching_Subjects_Page SHALL treat that course as having no
   Active_Enrollments and SHALL use the standard confirmation prompt on removal.
