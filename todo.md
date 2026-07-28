# Reading Prompts Web - Project TODO

## Phase 1: Database & Schema Setup
- [x] Upgrade to web-db-user (database + server + auth)
- [x] Install dependencies
- [ ] Create users table with student/admin roles
- [ ] Create students table (for admin to manage)
- [ ] Create student_quotas table (track remaining articles per student)
- [ ] Create usage_log table (track which articles each student viewed)
- [ ] Run database migrations

## Phase 2: Authentication System
- [ ] Implement login page with role selection (admin/student)
- [ ] Add admin login with hardcoded credentials (admin/readingadmin)
- [ ] Add student login with username/password from database
- [ ] Implement logout functionality
- [ ] Add protected routes based on user role

## Phase 3: Admin Dashboard
- [ ] Create admin dashboard page
- [ ] Implement student management (list, add, edit, delete)
- [ ] Add form to create new student (name, username, password, quota)
- [ ] Add form to edit student details and quota
- [ ] Display current quota and usage for each student
- [ ] Implement quota adjustment functionality

## Phase 4: Student Interface
- [ ] Display remaining quota at top of page
- [ ] Show article list with quota info
- [ ] Implement article click handler to check quota
- [ ] Add confirmation dialog before viewing article
- [ ] Deduct 1 from quota after viewing
- [ ] Update usage_log table
- [ ] Show "quota exhausted" message when limit reached
- [ ] Expand prompt content (make it much longer and more detailed)

## Phase 5: Enhanced Prompts
- [ ] Expand all 20 article prompts with more detailed content
- [ ] Add key points section for each article
- [ ] Add reading strategies section
- [ ] Add potential exam questions hints

## Phase 6: Testing & Polish
- [ ] Test complete admin workflow
- [ ] Test complete student workflow
- [ ] Test quota deduction logic
- [ ] Test edge cases (quota = 0, multiple logins, etc.)
- [ ] Add error handling and validation
- [ ] Improve UI/UX based on testing

## Phase 7: Deployment
- [ ] Create database checkpoint
- [ ] Test on production environment
- [ ] Verify all features work correctly
