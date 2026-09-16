# Practice Projects — Backend Track

Based on where the codebase currently is: Express 5 + Mongoose, Multer + ImageKit
file uploads (`day-4`), and a JWT/RBAC project scaffold already started
(`project-management` — "Project Camp Backend"). The projects below skip
basic CRUD (you've already built that three times over `day-1` → `day-4`)
and instead force you to reason about concurrency, consistency, algorithms,
and system design — the stuff CRUD alone doesn't teach.

You currently know: basic `GET/POST/PATCH/DELETE` routes, reading
`req.body`/`req.params`, and simple Mongoose `find`/`create`. Every project
below assumes that as the floor and layers **one or two new concepts** on
top of it. Read the "Concepts you'll need" list under each project *before*
starting it — look each one up, understand it in isolation first, then try
to use it.

---

## 0. Prerequisite concepts — learn these regardless of which project you pick

- **Race condition** — what happens when two requests read-then-write the
  same data at nearly the same time, and why `findOne` + `save()` as two
  separate steps is unsafe.
- **Atomic operation** — a database operation (like Mongo's
  `findOneAndUpdate`) that reads and writes as one indivisible step, so no
  other request can sneak in between.
- **Idempotency** — making an operation safe to run twice with the same
  result (critical for retried network requests, e.g. "don't charge the
  wallet twice if the client resends a payment request").
- **Async/background processing** — not every request needs to finish its
  full work before responding; some work can be queued and done later by a
  separate process ("worker").
- **HTTP status codes beyond 200/201/404** — `409 Conflict`, `429 Too Many
  Requests`, `202 Accepted` (work queued, not done yet).

---

## 1. Double-Entry Wallet / Ledger Service
Build a wallet system (deposit, withdraw, transfer between users) where every
money movement is stored as an immutable ledger entry, not a mutable balance
field.

**Why it's hard:** you must guarantee the ledger never goes negative under
concurrent requests (two withdrawals racing on the same balance), keep every
transaction atomic and idempotent (retried network requests must not double-charge),
and make balance = sum(ledger entries) reconcilable at any point in time.

**Concepts you'll need:**
- MongoDB **transactions/sessions** (`session.startTransaction()`) — group
  multiple writes so they all succeed or all fail together.
- **Optimistic locking** (a `version` field that increments on write, so a
  stale update is rejected) vs **pessimistic locking** (lock the row until
  you're done).
- Idempotency keys — client sends a unique request ID, server stores it and
  refuses to re-apply an already-seen one.
- Basic double-entry bookkeeping (every transfer = one debit + one credit,
  they must always sum to zero).

---

## 2. Custom Job Queue (build the queue, not just use one)
Instead of reaching for BullMQ, implement your own background job processor
backed by Mongo or Redis: `enqueue`, `worker pool`, `retry with exponential
backoff`, `dead-letter queue`, `at-least-once delivery`.

**Why it's hard:** avoiding double-processing when two workers poll the same
job, designing backoff/retry limits, and making job state transitions
(`pending → processing → done/failed → dead-letter`) crash-safe (a worker
that dies mid-job shouldn't lose or duplicate the job).

**Concepts you'll need:**
- **Polling** — a worker loop that repeatedly checks the DB for new work
  (`setInterval`, or a `while` loop with a delay).
- **Atomic "claim" via `findOneAndUpdate`** — how a worker grabs a job
  without two workers grabbing the same one.
- **State machines** — modeling a job's lifecycle as a fixed set of states
  and allowed transitions between them.
- **Exponential backoff** — waiting `2^n` seconds longer after each failed
  retry, instead of retrying instantly.
- **Dead-letter queue** — a place failed jobs go after exhausting retries,
  so they don't get silently dropped or retried forever.

---

## 3. Feed Ranking Service (fan-out on write vs fan-out on read)
Build a social feed (posts + follows) and implement **both** fan-out
strategies, then benchmark them: fan-out-on-write (push a post into every
follower's precomputed feed at post time) vs fan-out-on-read (compute the
feed at request time by merging followed users' posts).

**Why it's hard:** fan-out-on-write breaks down for users with huge follower
counts (the "celebrity problem") — you have to design a hybrid. Feed
pagination must be stable even as new posts arrive mid-scroll (cursor-based,
not offset-based).

**Concepts you'll need:**
- **Fan-out** (write-time vs read-time) — the two fundamental strategies for
  building "timelines" at scale.
- **Cursor-based pagination** (`?after=<id>`) vs **offset pagination**
  (`?page=2`) and why offset pagination gives duplicate/missing results when
  data changes between requests.
- Basic **caching** (storing a precomputed feed so you don't recompute it on
  every request) and **cache invalidation** (knowing when to throw that
  cache away).
- **Database indexing** — why `find().sort()` needs an index to stay fast as
  data grows.

---

## 4. Real-Time Collaborative Editor (CRDT or OT)
A shared text document (or task board) multiple users edit simultaneously
over WebSockets, with changes converging correctly regardless of arrival
order.

**Why it's hard:** naive "last write wins" corrupts concurrent edits. You
need an actual conflict resolution algorithm — a simple CRDT (e.g.
RGA/Logoot-style sequence) or basic Operational Transformation — plus
presence (who's online, cursor position) and reconnect/resync handling.

**Concepts you'll need:**
- **WebSockets** (`socket.io` or `ws`) — a persistent two-way connection,
  unlike request/response HTTP.
- **CRDT (Conflict-free Replicated Data Type)** — a data structure designed
  so concurrent edits from different users always merge into the same
  result, with no central coordinator needed.
- **Operational Transformation (OT)** — the alternative approach (used by
  Google Docs) that transforms one user's edit against another's so they
  apply correctly regardless of order.
- **Message ordering / vector clocks** — how you know which edit "happened
  before" another when they arrive out of order over the network.

This is the most advanced project on this list — do it last.

---

## 5. Rate Limiter as Reusable Middleware (multiple algorithms)
Implement token bucket, sliding-window-log, and sliding-window-counter rate
limiters as pluggable Express middleware, backed by Redis, and load-test
them to show where each one breaks down.

**Why it's hard:** getting the sliding-window counter math right under
concurrent requests, avoiding race conditions in the Redis
increment-and-check (needs `MULTI`/Lua scripting for atomicity), and
designing a fair per-user + per-IP composite key strategy.

**Concepts you'll need:**
- **Express middleware** — a function that runs before your route handler
  (you've likely seen this with `multer`/`express.json()` already; now
  you'll write your own).
- **Redis** basics — an in-memory key-value store, and why it's used instead
  of Mongo for fast counters (`INCR`, `EXPIRE`).
- **Token bucket / sliding window algorithms** — different mathematical
  models for "how many requests has this user made recently."
- **Atomicity in Redis** (`MULTI/EXEC` or Lua scripts) — doing
  read-check-increment as one atomic step so concurrent requests don't both
  slip through.
- **Load testing** (e.g. `autocannon` or `k6`) — sending many concurrent
  requests to see where your limiter actually breaks.

---

## 6. Resumable / Chunked Large File Upload Pipeline
Extend the `day-4` ImageKit upload flow into a resumable upload system:
client uploads a large file in chunks, server tracks which chunks arrived,
reassembles them, and can resume after a dropped connection — then kicks off
an async processing pipeline (thumbnail generation, virus-scan stub,
metadata extraction) as background jobs (reuse project #2).

**Why it's hard:** tracking partial upload state safely, handling
out-of-order or duplicate chunk arrival, cleaning up abandoned uploads
(TTL/garbage collection), and making the "finalize" step idempotent.

**Concepts you'll need:**
- **Chunked/multipart upload protocol** — splitting a file client-side and
  sending pieces with an index + total count.
- **Streams** in Node.js — writing chunks to disk/storage without loading
  the whole file into memory (you're currently using `multer.memoryStorage()`,
  which won't scale to large files).
- **State machine** for upload status (again — this reinforces project #2).
- **TTL / garbage collection** — automatically expiring incomplete uploads
  after N hours (MongoDB TTL indexes are the easy way in).

---

## 7. Multi-Tenant RBAC → ABAC Upgrade
Take the `project-management` PRD's 3-tier RBAC (Admin / Project Admin /
Member) and generalize it into attribute-based access control: permissions
become policy rules evaluated against `(user attributes, resource
attributes, action)` instead of a hardcoded role check in each route.

**Why it's hard:** designing a policy evaluation engine that's both
expressive and fast, avoiding an N+1 permission-check-per-request problem,
and supporting per-project role overrides (a user can be Admin on Project A,
Member on Project B) cleanly instead of with `if/else` sprawl.

**Concepts you'll need:**
- **RBAC vs ABAC** — role-based ("is this user an admin?") vs
  attribute-based ("does this user own this resource, in this project,
  during business hours?") access control.
- **JWT** (JSON Web Tokens) — you'll need this working first (the PRD
  already calls for it); understand what's *in* a JWT payload and why you
  don't hit the DB just to check who's logged in.
- **Middleware composition** — chaining an `authenticate` middleware then an
  `authorize` middleware.
- **N+1 query problem** — why checking permissions with a separate DB query
  per request (or per item in a list) is slow, and how caching/preloading
  avoids it.
- **Multi-tenancy / data scoping** — making sure every query filters by
  tenant/project so users can never see another tenant's data even by
  accident.

---

## 8. Outbox Pattern for Reliable Event Publishing
Add a notification system (email/webhook on task-assigned, note-created,
etc. in `project-management`) using the **transactional outbox pattern**:
write the event to an `outbox` collection in the same transaction as the
business write, then a separate poller publishes it and marks it sent.

**Why it's hard:** the entire point is guaranteeing "the DB write and the
event publish never disagree" without a distributed transaction across
Mongo and your notification service — this is a real production pattern for
solving dual-write inconsistency.

**Concepts you'll need:**
- **The "dual write" problem** — why writing to your DB and then separately
  calling an email/notification API is unsafe (one can succeed while the
  other fails).
- **Transactional outbox pattern** — the standard fix: write the event as a
  row/document in the *same* transaction as the real change, then a poller
  publishes it asynchronously.
- **At-least-once delivery** — accepting that an event might be sent twice,
  and designing the *consumer* to handle duplicates safely (idempotency
  again — it keeps coming back because it's foundational).
- **Event-driven architecture** basics — producers, consumers, and why
  decoupling them this way is more resilient than direct function calls.

---

## Suggested order
Given the current stack, a reasonable progression is:
**5 (rate limiter)** → **2 (job queue)** → **6 (chunked uploads, built on #2)**
→ **1 (ledger)** → **8 (outbox)** → **7 (ABAC)** → **3 (feed ranking)** →
**4 (CRDT editor, the hardest)**.

This order is also a rough difficulty ramp in terms of *new concepts per
project* — each one reuses at least one idea from the project before it
(state machines, idempotency, and atomicity show up repeatedly on purpose),
so you're not starting from zero every time.
