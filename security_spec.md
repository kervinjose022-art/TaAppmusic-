# Security Specification for Tappmusic.com VIP Task Portal

## 1. Data Invariants
1. A **UserProfile** document can only be created by an authenticated user, and can only be modified by its owner (or the admin Kervin).
2. Users can never change their own `earnings` or `vipLevel` unless approved by Kervin (managed through registrations approval).
3. A **Registration** request can be created by any user to register their proof, but can only be updated/changed/approved by Kervin the admin.
4. A **Withdrawal** request can be created by any registered user with their own username, but can only be updated/approved/rejected by Kervin the admin.

## 2. The "Dirty Dozen" Payloads
Below are 12 malicious payload signatures designed to bypass rules:
1. **Admin Spoofing**: Attempt to create a user profile declaring `vipLevel: 'VIP CORONA IMPERIAL 1000$'` directly.
2. **Infinite Balance**: Injecting arbitrary high numbers into `earnings` when updating user profile.
3. **Reference Hijacking**: Modifying the reference number of a registration after it was sent.
4. **Self-Approval**: Direct update of a pending registration request's status to `approved` by a normal user.
5. **Withdrawal Fraud**: Submitting a withdrawal request under another user's nickname.
6. **Double-Withdrawal**: Rapidly triggering deletion of original withdrawal and replacing it with a larger amount.
7. **Privilege Escalation**: Attempting to write into `/admins/` path.
8. **Orphaned Registration**: Creating a registration request with an invalid/non-existent username.
9. **Identity Forgery**: Creating a profile where the target username differs from the logged-in session.
10. **Admin Bypass**: Attempting to approve an existing registration without authenticating as Kervin.
11. **Timestamp Spoofing**: Overwriting previous registration records with falsified history timestamp values.
12. **Foreign Data Harvesting**: Attempting a blanket query/read on the `/users` collection as a guest.

## 3. The Rules Test Case Design
Our security rules (`firestore.rules`) will reject all malicious attempts by using secure attribute gates, checking that only the admin or owner can execute write operations.
