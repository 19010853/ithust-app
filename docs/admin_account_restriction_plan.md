# Admin Account Restriction Plan

## 1. Context

Admin needs the ability to lock or unlock a user account, and also lock or unlock a user's ability to act as a seller. The risky case is when the user is currently involved in an active transaction, either as a buyer or as a seller.

If the system simply blocks the account immediately, it can create broken order flows:

- A seller with an active order may no longer be able to deliver work.
- A buyer with an active order may no longer be able to approve delivery, request revision, or receive support.
- Payment, refund, withdrawal, and dispute flows may be left in an unclear state.
- Chat and order activity history may become inaccessible to one side.

Large marketplaces usually avoid a single "all or nothing" lock model. They use graduated enforcement. For example, Fiverr distinguishes account restriction, non-eligibility to sell, and permanent suspension. In restricted or sell-ineligible states, users may still be allowed to complete active orders and access cleared funds. Upwork similarly distinguishes restricted accounts, which may still complete current work, from blocked accounts, where contracts can be canceled and access can be removed.

The recommended approach for this project is to separate account access from seller capability.

## 2. Proposed Status Model

### Account Status

Use this for the user's general account access.

| Status | Meaning |
| --- | --- |
| `ACTIVE` | User can log in and use the platform normally. |
| `ACCOUNT_LOCKED` | User account is locked. This should be reserved for serious risk, fraud, abuse, or emergency cases. |

### Seller Status

Use this for the user's selling capability.

| Status | Meaning |
| --- | --- |
| `ACTIVE` | Seller can create gigs, activate gigs, receive orders, and manage existing orders. |
| `SELLER_RESTRICTED` | Seller cannot create new gigs, activate gigs, or receive new orders. Seller can still complete active orders. |
| `SELLER_LOCKED_HARD` | Seller actions are blocked. Existing active orders require admin review, cancellation, refund, or manual resolution. |

## 3. Recommended Business Rules

### Active Order Definition

Treat an order as active if it is not in a final state.

Final states:

- `Completed`
- `Cancelled`

Active or sensitive states:

- `PENDING_PAYMENT`
- `IN_PROGRESS`
- `Delivered`
- `REFUND_REQUESTED`
- Any other non-final order status currently used by the order service

### Locking Seller Capability

When admin applies `SELLER_RESTRICTED`:

- Pause or hide all active gigs from search and checkout.
- Prevent seller from creating new gigs.
- Prevent seller from reactivating paused gigs.
- Prevent buyers from placing new orders for that seller's gigs.
- Allow seller to continue order-specific actions for active orders:
  - send order messages
  - deliver work
  - request delivery extension
  - respond to buyer activity
- Allow buyer to continue order-specific actions:
  - send order messages
  - approve delivery
  - request revision if supported
  - request refund if supported

When admin applies `SELLER_LOCKED_HARD`:

- Pause or hide all gigs.
- Block seller order actions.
- Keep order pages visible to admin.
- Require admin to decide whether each active order should be canceled, refunded, or manually resolved.

When admin restores seller status to `ACTIVE`:

- Do not automatically reactivate gigs.
- Let seller or admin manually reactivate gigs to avoid accidental marketplace exposure.

### Locking Full Account

When admin applies `ACCOUNT_LOCKED`:

- Block normal login or authenticated platform access.
- Keep admin access to the user's historical data.
- If the user has active orders, show a force-confirmation warning before applying the lock.
- Do not automatically cancel orders unless a separate admin action explicitly does so.

Recommended warning data before lock:

- Active orders as buyer
- Active orders as seller
- Pending withdrawals
- Available seller balance
- Active gigs

### Withdrawals and Funds

For `SELLER_RESTRICTED`:

- Allow withdrawal of cleared/available funds unless the restriction reason is payment fraud, chargeback, or identity risk.
- Continue blocking withdrawal requests that are already invalid under existing withdrawal rules.

For `SELLER_LOCKED_HARD` or `ACCOUNT_LOCKED`:

- Hold new withdrawal actions by default.
- Let admin review pending withdrawal requests manually.
- Keep withdrawal history visible to admin.

### Chat and Order Communication

For `SELLER_RESTRICTED`:

- General chat may be limited.
- Order-specific communication should remain available for active orders.

For `SELLER_LOCKED_HARD`:

- Seller communication can be blocked.
- Admin should still see conversation/order history for investigation.

For `ACCOUNT_LOCKED`:

- User communication is blocked unless a dedicated appeal/support flow is later added.

## 4. Implementation Plan

### Backend

Add status fields:

- Auth account:
  - `accountStatus`
  - `lockedReason`
  - `lockedAt`
  - `lockedBy`
- Buyer profile:
  - mirror `accountStatus` for search/detail display
- Seller profile:
  - `sellerStatus`
  - `sellerStatusReason`
  - `sellerStatusUpdatedAt`
  - `sellerStatusUpdatedBy`

Add admin APIs:

- `PATCH /admin/users/:username/account-status`
- `PATCH /admin/users/:username/seller-status`
- `GET /admin/users/:username/restriction-preview`

The preview API should return:

- user identity summary
- current account status
- current seller status
- active buyer order count
- active seller order count
- pending withdrawal count
- available balance
- active gig count

Enforce status rules in relevant services:

- Auth service:
  - block login/session refresh for `ACCOUNT_LOCKED`
- Gig service:
  - block create/update/reactivate gig when seller is restricted or hard locked
  - hide or pause gigs when seller is restricted or hard locked
- Order service:
  - block new order placement for restricted or hard locked sellers
  - allow active order completion for restricted sellers
  - block seller actions for hard locked sellers
- Users service:
  - expose status fields in admin user detail
  - update seller/account status from admin APIs
- Gateway:
  - add admin-protected routes
  - forward preview and status update calls

### Frontend

Update Admin User Detail:

- Show account status and seller status.
- Add actions:
  - Lock account
  - Unlock account
  - Restrict seller
  - Hard lock seller
  - Restore seller
- Before submitting a status change, open a confirmation modal with preview data.
- Require admin to enter a reason.
- If active orders exist, recommend `SELLER_RESTRICTED` instead of `ACCOUNT_LOCKED`.

Update seller/gig/order UI:

- Hide create/reactivate gig actions when seller is restricted.
- Show clear status banners to restricted sellers.
- Keep active order pages usable for restricted sellers.
- Show buyer-facing message when a seller cannot accept new orders.

### Audit Log

Create an audit record for every admin restriction action.

Recommended audit fields:

- `adminId`
- `adminUsername`
- `targetUsername`
- `action`
- `previousStatus`
- `nextStatus`
- `reason`
- `activeBuyerOrders`
- `activeSellerOrders`
- `pendingWithdrawals`
- `availableBalance`
- `createdAt`

### Notifications

Notify the affected user when:

- account is locked
- account is unlocked
- seller capability is restricted
- seller capability is restored
- seller is hard locked

Notification should include:

- status change
- short reason
- what the user can still do
- where to contact support or admin

## 5. Test Plan

Backend tests:

- Admin can lock and unlock account.
- Admin can restrict, hard lock, and restore seller status.
- Non-admin cannot call restriction APIs.
- Lock preview returns active order counts and financial summary.
- Restricted seller cannot create or reactivate gigs.
- Restricted seller cannot receive new orders.
- Restricted seller can still deliver active `IN_PROGRESS` order.
- Hard locked seller cannot perform seller order actions.
- Buyer can still approve delivery for an order with a restricted seller.
- Withdrawals are held or allowed according to status rules.

Frontend tests/manual checks:

- Admin user detail shows account and seller status.
- Status action modal requires reason.
- Modal warns when active orders exist.
- Restricted seller sees marketplace limitation banner.
- Restricted seller can still access active order activities.
- Buyers cannot checkout gigs from restricted sellers.
- Restoring seller status does not auto-reactivate gigs.

## 6. Assumptions

- This document is a design plan only and does not implement code changes.
- The first implementation phase should avoid automatic cancellation or refund.
- Active orders should remain recoverable and visible to admin.
- Seller restriction is the preferred action when the goal is to stop new marketplace activity without breaking active orders.
- Full account lock should be reserved for high-risk cases.
- Unlocking seller status should not automatically reactivate gigs.
