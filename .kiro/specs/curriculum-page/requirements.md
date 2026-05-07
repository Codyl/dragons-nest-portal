# Requirements Document

## Introduction

This feature implements a Curriculum page at `/curriculum` that shows the
required subjects for a household's home-school program based on the adult
user's state compliance laws. The page fetches the user's state from their
profile, retrieves the state's compliance laws from a new backend endpoint, and
cross-references the `subjectsRequiredTopicIds` array against the subjects
catalog to display a list of required subject cards. The page is read-only and
student-context-aware: it re-renders when the active student changes in the
sidebar, but the required subjects are determined by the adult user's state, not
the student's grade.

---

## Glossary

- **Adult_User**: An authenticated user whose `accountType` is `adult`.
- **Active_Student**: The household student currently selected in the sidebar,
  provided by the `useStudent()` context hook as `activeStudent`.
- **Compliance_Laws**: The `StateComplianceLaws` document for a given US state,
  stored in the `state_compliance_laws` MongoDB collection. Contains
  `subjectsRequiredTopicIds` — an array of ObjectIds referencing the `topics`
  (subjects) collection.
- **Required_Subject**: A `Subject` catalog entry whose `_id` appears in the
  state's `subjectsRequiredTopicIds` array.
- **Subject**: A catalog entry in the `topics` MongoDB collection, containing
  `_id`, `name`, `icon`, `color`, `slug`, and `isEnrichment`.
- **Curriculum_Page**: The page at `/curriculum` introduced by this feature.
- **Compliance_API**: The new NestJS endpoint `GET /compliance/:state` that
  returns the `StateComplianceLaws` document for the given state abbreviation.
- **Subjects_API**: The existing unauthenticated endpoint `GET /subjects` that
  returns the full subject catalog.
- **Profile_API**: The existing authenticated endpoint `GET /profile` that
  returns the adult user's profile, including their `state` field.

---

## Requirements

### Requirement 1: Page Access and Route Setup

**User Story:** As an Adult_User, I want a dedicated Curriculum page at
`/curriculum`, so that I can see the subjects required by my state's home-school
compliance laws.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to `/curriculum`, THE Curriculum_Page
   SHALL render within the existing private layout shell.
2. WHEN an unauthenticated user navigates to `/curriculum`, THE Curriculum_Page
   SHALL redirect the user to the login route, consistent with the existing
   private route guard behavior.
3. THE Curriculum_Page SHALL set a `<title>` meta tag with the value
   `Curriculum | Cody Lillywhite`.

---

### Requirement 2: Fetch User State from Profile

**User Story:** As an Adult_User, I want the Curriculum page to automatically
use my registered state, so that I do not have to manually select my state each
time I visit.

#### Acceptance Criteria

1. WHEN the Curriculum_Page loads, THE Curriculum_Page SHALL fetch the
   authenticated user's profile from the Profile_API to obtain the `state`
   field.
2. WHILE the profile data is loading, THE Curriculum_Page SHALL display a
   loading indicator in place of the subject list.
3. IF the Profile_API returns an error, THEN THE Curriculum_Page SHALL display
   an error message and a retry action.
4. IF the profile's `state` field is absent or null, THEN THE Curriculum_Page
   SHALL display a message prompting the user to complete their profile with a
   state selection.

---

### Requirement 3: Fetch State Compliance Laws

**User Story:** As an Adult_User, I want the app to retrieve my state's
compliance laws automatically, so that the required subjects list reflects the
legal requirements for my state.

#### Acceptance Criteria

1. WHEN the user's `state` is known, THE Curriculum_Page SHALL fetch the
   compliance laws for that state from the Compliance_API using the state
   abbreviation.
2. THE Compliance_API SHALL expose a `GET /compliance/:state` endpoint that
   accepts a US state abbreviation and returns the matching
   `StateComplianceLaws` document.
3. WHEN the `:state` parameter does not match any document in the
   `state_compliance_laws` collection, THEN THE Compliance_API SHALL return
   HTTP 404.
4. WHILE the compliance data is loading, THE Curriculum_Page SHALL display a
   loading indicator.
5. IF the Compliance_API returns an error, THEN THE Curriculum_Page SHALL
   display an error message and a retry action.

---

### Requirement 4: Fetch Subjects Catalog

**User Story:** As an Adult_User, I want the app to resolve subject names,
icons, and colors from the catalog, so that each required subject is displayed
with its visual identity.

#### Acceptance Criteria

1. WHEN the Curriculum_Page loads, THE Curriculum_Page SHALL fetch the full
   subject catalog from the Subjects_API.
2. WHILE the subjects data is loading, THE Curriculum_Page SHALL display a
   loading indicator.
3. IF the Subjects_API returns an error, THEN THE Curriculum_Page SHALL display
   an error message and a retry action.

---

### Requirement 5: Display Required Subjects

**User Story:** As an Adult_User, I want to see a list of the subjects required
by my state, so that I know which subjects my household must cover.

#### Acceptance Criteria

1. WHEN all three data sources (profile, compliance laws, subjects catalog) have
   loaded successfully, THE Curriculum_Page SHALL display one subject card for
   each Subject whose `_id` appears in the compliance laws'
   `subjectsRequiredTopicIds` array.
2. THE Curriculum_Page SHALL display the following fields on each subject card:
   subject `name`, subject `icon`, and subject `color`.
3. WHEN the compliance laws' `subjectsRequiredTopicIds` array is empty, THE
   Curriculum_Page SHALL display an empty-state message indicating that no
   required subjects are defined for the user's state.
4. WHEN a `subjectsRequiredTopicIds` entry does not match any Subject in the
   catalog, THE Curriculum_Page SHALL silently omit that entry from the
   displayed list.
5. THE Curriculum_Page SHALL NOT provide any add, remove, or edit controls for
   the displayed subjects.

---

### Requirement 6: Active Student Context

**User Story:** As an Adult_User managing multiple students, I want the
Curriculum page to acknowledge the currently selected student, so that I can see
which student's curriculum I am reviewing.

#### Acceptance Criteria

1. WHEN an Active_Student is selected, THE Curriculum_Page SHALL display the
   active student's `displayName` as a contextual label near the subject list.
2. WHEN no Active_Student is selected, THE Curriculum_Page SHALL display the
   subject list without a student-specific label.
3. WHEN the Active_Student changes in the sidebar, THE Curriculum_Page SHALL
   update the displayed student label without a full page reload.
4. THE Curriculum_Page SHALL NOT change the set of displayed Required_Subjects
   when the Active_Student changes, because required subjects are determined by
   the adult user's state, not the student.

---

### Requirement 7: Backend — Compliance Laws Endpoint

**User Story:** As a developer, I want a dedicated API endpoint for retrieving
state compliance laws, so that the frontend can fetch the required subjects for
any US state.

#### Acceptance Criteria

1. THE Compliance_API SHALL expose `GET /compliance/:state` that accepts a US
   state abbreviation (case-insensitive) and returns the full
   `StateComplianceLaws` document for that state.
2. WHEN the `:state` parameter matches a document in the `state_compliance_laws`
   collection, THE Compliance_API SHALL return HTTP 200 with the document.
3. WHEN the `:state` parameter does not match any document, THEN THE
   Compliance_API SHALL return HTTP 404 with a descriptive error message.
4. THE Compliance_API SHALL require authentication via the existing `AuthGuard`
   so that compliance data is only accessible to logged-in users.
5. THE Compliance_API SHALL be implemented in the existing `ComplianceModule` by
   adding a `ComplianceController` and `ComplianceService`.
