# Security Specification for Lesson Recovery Management System

## Data Invariants
1. A **MissedLesson** cannot exist without a valid `unitId`, `trainerId`, `classRepId`, and `departmentId`.
2. Only a `class_rep` can create a `MissedLesson` report.
3. Only the assigned `trainer` can respond to a `MissedLesson` report.
4. Only an `hod` or `deputy_principal` can verify/approve a `MissedLesson` report.
5. **Recovery** can only be activated if the `MissedLesson` status is `VERIFIED_MISSED`.
6. `trainer` must upload session plans/attendance during the `ACTIVE` recovery phase.
7. `class_rep` must confirm recovery before final `hod` approval.
8. Status transitions must follow the defined workflow: `PENDING_VERIFICATION` -> `VERIFIED_MISSED` -> `RECOVERY_ACTIVE` -> `COMPLETED`.

## The "Dirty Dozen" Payloads (Deny Targets)
1. **Identity Spoofing**: `class_rep` tries to create a report with a different `classRepId`.
2. **Role Escalation**: `trainer` tries to approve their own missed lesson (setting status to `VERIFIED_MISSED`).
3. **Ghost Field**: Any update including `isAdmin: true` or `isVerified: true` in user profile.
4. **Illegal Transition**: `class_rep` tries to skip HOD verification and set status directly to `RECOVERY_ACTIVE`.
5. **PII Leak**: A `trainer` trying to list the private contact info (if any) of an `hod`.
6. **Orphaned Write**: Creating a `MissedLesson` for a non-existent `unitId`.
7. **Cross-Department Access**: `hod` of Dept A trying to approve a lesson in Dept B.
8. **Immutable Field Attack**: `trainer` trying to change the `week` or `date` of a verified missed lesson.
9. **Spam Attack**: `class_rep` sending a 2MB string in the `trainerComment` field.
10. **Resource Exhaustion**: Creating 10,000 notifications in a single batch.
11. **Session Hijack**: Updating a `Recovery` record belonging to another `missedLessonId`.
12. **Double Recovery**: Activating recovery twice for the same lesson.

## The Test Runner (Mock Tests)
- `test_create_report_as_trainer`: Fails (Only ClassRep can create).
- `test_update_status_to_verified_as_classrep`: Fails (Only HOD/DP can verify).
- `test_upload_attendance_as_hod`: Fails (Only Trainer can upload attendance).
- ... (Additional tests will be implemented in `firestore.rules.test.ts`)
