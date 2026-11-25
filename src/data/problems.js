/* ─────────────────────────────────────────────────────────────
   problems.js  –  Curated starter problem set (6 problems)
   ───────────────────────────────────────────────────────────── */

export const PROBLEM_CATEGORIES = {
  SYSTEM_DESIGN: 'System Design',
  BACK_OF_ENVELOPE: 'Back-of-the-Envelope',
  LOGIC_RIDDLE: 'Logic Riddle',
};

export const DIFFICULTIES = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

export const NODE_TYPES = [
  { type: 'client',         label: 'Client / Users',   icon: '👤', color: '#8B5CF6' },
  { type: 'cdn',            label: 'CDN',              icon: '🌐', color: '#06B6D4' },
  { type: 'load-balancer',  label: 'Load Balancer',    icon: '⚖️', color: '#F59E0B' },
  { type: 'api-gateway',    label: 'API Gateway',      icon: '🚪', color: '#EC4899' },
  { type: 'web-server',     label: 'Web Server',       icon: '🖥️', color: '#3B82F6' },
  { type: 'sql-db',         label: 'SQL Database',     icon: '🗄️', color: '#10B981' },
  { type: 'nosql-db',       label: 'NoSQL Database',   icon: '📦', color: '#F97316' },
  { type: 'cache',          label: 'Redis Cache',      icon: '⚡', color: '#EF4444' },
  { type: 'message-queue',  label: 'Message Queue',    icon: '📨', color: '#8B5CF6' },
  { type: 'storage',        label: 'Blob Storage',     icon: '💾', color: '#6366F1' },
  { type: 'worker',         label: 'Worker Service',   icon: '⚙️', color: '#14B8A6' },
  { type: 'notification',   label: 'Notification Svc', icon: '🔔', color: '#F43F5E' },
];

// ──────────────────── Problems ────────────────────

export const problems = [
  /* ───── 1. URL Shortener ───── */
  {
    id: 'url-shortener',
    title: 'Design a URL Shortener (TinyURL)',
    category: PROBLEM_CATEGORIES.SYSTEM_DESIGN,
    difficulty: DIFFICULTIES.EASY,
    acceptanceRate: 72,

    description: `Design a URL shortening service similar to TinyURL or bit.ly.

The service should:
- Accept a long URL and return a shortened URL
- Redirect users from the short URL to the original long URL
- Support custom short URL aliases (optional)
- Track click analytics (optional)
- Handle high read throughput efficiently

**Example:**
- Input: \`https://www.example.com/very/long/path/to/resource?param=value\`
- Output: \`https://tiny.url/abc1234\``,

    constraints: {
      dau:          '100 M daily active users',
      writeQps:     '1,000 new URLs / second',
      readQps:      '10,000 redirections / second (10 : 1 read / write ratio)',
      latency:      '< 100 ms for redirection',
      urlLength:    'Short URL key ≤ 7 characters',
      storage:      'Store URLs for 5 years',
      availability: '99.9 % uptime',
    },

    hints: [
      'Think about how to generate unique short keys. What encoding schemes allow compact representation?',
      'With a 10:1 read-to-write ratio the system is read-heavy. How can caching help?',
      'Consider what happens when two users try to shorten the same URL. Should they get the same short URL?',
      'How would you handle the case where a generated key already exists in the database?',
    ],

    solution: `## Architecture Overview

**Key Components:**
1. **Client → Load Balancer → API Servers** – Distribute incoming requests across multiple stateless API servers.
2. **API Servers → Cache (Redis)** – Check cache first for URL lookups (read-heavy optimisation).
3. **API Servers → SQL / NoSQL Database** – Persistent storage for URL mappings.

**URL Generation Strategy:**
- Use Base62 encoding (a-z, A-Z, 0-9) for short keys.
- 7 characters → 62^7 ≈ 3.5 trillion unique URLs.
- Use a counter-based or hash-based approach (MD5 / SHA-256 → take first 7 chars of Base62).

**Key Design Decisions:**
- **Read-heavy optimisation** – Use Redis cache with TTL for frequently accessed URLs.
- **Database choice** – NoSQL (e.g. DynamoDB) for simple key-value lookups at scale.
- **Hashing with collision handling** – If a hash collision occurs, append a counter and rehash.
- **301 vs 302 redirect** – 302 (temporary) if tracking analytics; 301 (permanent) for caching.

**Storage Estimation:**
- 1,000 writes/s × 86,400 s/day × 365 days × 5 years ≈ 158 B records
- Each record ≈ 500 bytes → ~79 TB total storage`,

    requiredNodes: ['client', 'load-balancer', 'web-server', 'cache'],
    requiredConnections: [
      { from: 'client',        to: 'load-balancer' },
      { from: 'load-balancer', to: 'web-server' },
    ],
    keyConcepts: ['hashing', 'base62', 'cache', 'read-heavy', 'redirect', '301', '302', 'collision'],
  },

  /* ───── 2. Rate Limiter ───── */
  {
    id: 'rate-limiter',
    title: 'Design a Rate Limiter',
    category: PROBLEM_CATEGORIES.SYSTEM_DESIGN,
    difficulty: DIFFICULTIES.MEDIUM,
    acceptanceRate: 58,

    description: `Design a distributed rate limiting system that controls the rate of requests a client can send to an API.

The rate limiter should:
- Limit requests per client based on configurable rules (e.g. 100 req / min per user)
- Work in a distributed environment with multiple API servers
- Return appropriate HTTP status codes (429 Too Many Requests) when the limit is exceeded
- Support different rate limiting strategies
- Minimise latency overhead

**Use Cases:**
- Prevent DDoS attacks
- Prevent resource starvation by abusive clients
- Manage API quotas for different pricing tiers`,

    constraints: {
      dau:          '50 M daily active users',
      writeQps:     '10,000 rate-check operations / second',
      readQps:      'Every API request requires a rate check',
      latency:      '< 5 ms overhead per rate check',
      rules:        'Support per-user, per-IP, and per-API-endpoint rules',
      availability: '99.99 % uptime (failure should allow requests, not block)',
    },

    hints: [
      'Consider different rate limiting algorithms: Token Bucket, Leaking Bucket, Fixed Window, Sliding Window Log, Sliding Window Counter.',
      'In a distributed system, how do multiple servers share rate limit counters? Think about centralised vs. local counting.',
      'Redis is commonly used for rate limiting. Why? Think about atomic operations and TTL.',
      'What should happen when the rate limiter service itself is down? Fail-open or fail-closed?',
    ],

    solution: `## Architecture Overview

**Key Components:**
1. **Client → API Gateway / Load Balancer** – Entry point for all requests.
2. **Rate Limiter Middleware** – Sits before application logic, checks counters.
3. **Redis Cache** – Centralised counter storage with atomic operations and TTL.
4. **Rules Database** – Stores rate limiting rules per user / tier / endpoint.

**Algorithm – Sliding Window Counter:**
- Combines Fixed Window and Sliding Window Log.
- Weighted count: current_window × overlap% + previous_window × (1 − overlap%).
- Memory-efficient, smooth rate limiting.

**Token Bucket Alternative:**
- Each user has a bucket with max tokens (capacity).
- Tokens are added at a fixed rate (refill rate).
- Each request consumes one token.
- Stored in Redis: \`{ tokens: N, last_refill: timestamp }\`.

**Key Design Decisions:**
- **Redis for counters** – Atomic INCR + EXPIRE, sub-millisecond latency.
- **Fail-open policy** – If Redis is down, allow requests (availability > strict limiting).
- **HTTP Headers** – Return X-RateLimit-Remaining, X-RateLimit-Limit, X-RateLimit-Retry-After.
- **Race conditions** – Use Redis Lua scripts for atomic check-and-increment.
- **Distributed sync** – Centralised Redis cluster, or local counters with periodic sync.`,

    requiredNodes: ['client', 'api-gateway', 'cache', 'web-server'],
    requiredConnections: [
      { from: 'client',      to: 'api-gateway' },
      { from: 'api-gateway', to: 'cache' },
      { from: 'api-gateway', to: 'web-server' },
    ],
    keyConcepts: ['token bucket', 'sliding window', 'redis', 'atomic', 'distributed', 'rate limit', '429', 'fail-open'],
  },

  /* ───── 3. Real-Time Notification System ───── */
  {
    id: 'notification-system',
    title: 'Design a Real-Time Notification System',
    category: PROBLEM_CATEGORIES.SYSTEM_DESIGN,
    difficulty: DIFFICULTIES.HARD,
    acceptanceRate: 34,

    description: `Design a scalable real-time notification system that supports multiple channels (push notifications, email, SMS, in-app).

The system should:
- Deliver notifications across multiple channels (push, email, SMS, in-app)
- Support real-time delivery with minimal latency
- Handle notification preferences and opt-outs per user
- Support both targeted (single user) and broadcast (millions of users) notifications
- Guarantee at-least-once delivery
- Prevent duplicate notifications
- Support notification templates and personalisation

**Example Triggers:**
- User receives a new message → push notification + in-app
- Order shipped → email + SMS + push
- System maintenance → broadcast to all users`,

    constraints: {
      dau:           '10 M daily active users',
      notifications: '1 billion notifications / day',
      latency:       '< 1 second for real-time push notifications',
      channels:      'Push (iOS / Android), Email (SMTP), SMS (Twilio), In-App (WebSocket)',
      throughput:    '~12,000 notifications / second average, 50 K+ peak',
      reliability:   'At-least-once delivery guarantee',
      storage:       'Notification history for 30 days',
    },

    hints: [
      'Think about decoupling notification creation from delivery. What design pattern helps here?',
      'Different channels have vastly different latencies (push: ms, email: seconds, SMS: seconds). Should they be handled by the same service?',
      'How would you handle sending a notification to 10 million users (e.g. a broadcast)? Think about fan-out strategies.',
      'What happens if a notification fails to deliver? Consider retry strategies and dead-letter queues.',
      'How do you prevent the same notification from being sent twice? Think about idempotency keys.',
    ],

    solution: `## Architecture Overview

**Key Components:**
1. **Notification Service (API)** – Receives notification requests, validates, publishes to message queue.
2. **Message Queue (Kafka / RabbitMQ)** – Decouples creation from delivery, handles back-pressure.
3. **Worker Services** – Channel-specific workers (Push Worker, Email Worker, SMS Worker).
4. **User Preference Service + Database** – Stores user channel preferences and opt-outs.
5. **Template Service** – Renders notification content from templates.
6. **Redis Cache** – Deduplication, rate limiting per user, real-time delivery tracking.
7. **WebSocket Gateway** – For in-app real-time notifications.

**Data Flow:**
1. Event trigger → Notification API → Validate + enrich → Publish to Message Queue
2. Message Queue → Fan-out to channel-specific queues
3. Channel Workers → Fetch user preferences → Render template → Deliver via channel provider
4. On failure → Retry with exponential back-off → Dead-letter queue after N retries

**Key Design Decisions:**
- **Message Queue for decoupling** – Kafka for high throughput, ordered delivery.
- **Fan-out strategy** – For broadcasts, use a separate "broadcast" topic; workers pull user batches.
- **Deduplication** – Use idempotency keys stored in Redis with TTL.
- **Priority queues** – High-priority (security alerts) vs. low-priority (marketing).
- **Rate limiting per user** – Prevent notification fatigue (max N notifications / hour per user).
- **WebSocket for real-time** – Persistent connections for in-app notifications.
- **At-least-once delivery** – Acknowledge only after successful delivery; idempotency prevents duplicates.`,

    requiredNodes: ['client', 'load-balancer', 'web-server', 'message-queue', 'worker', 'cache'],
    requiredConnections: [
      { from: 'client',        to: 'load-balancer' },
      { from: 'load-balancer', to: 'web-server' },
      { from: 'web-server',    to: 'message-queue' },
      { from: 'message-queue', to: 'worker' },
    ],
    keyConcepts: ['message queue', 'fan-out', 'websocket', 'deduplication', 'idempotency', 'retry', 'dead-letter', 'rate limit', 'priority', 'at-least-once'],
  },

  /* ───── 4. Wine Bottles & Rats ───── */
  {
    id: 'wine-bottles-poison',
    title: 'The 1000 Wine Bottles & 10 Rats Poison Riddle',
    category: PROBLEM_CATEGORIES.LOGIC_RIDDLE,
    difficulty: DIFFICULTIES.MEDIUM,
    acceptanceRate: 45,

    description: `You are a king with **1,000 wine bottles**, and you know that **exactly one** of them is poisoned. You have **10 rats** available to test the wine.

**Rules:**
- The poison takes exactly **24 hours** to take effect. After 24 hours, any rat that consumed even a drop of poisoned wine will die.
- You can mix wines from multiple bottles and give the mixture to any rat.
- Each rat can drink from as many bottles as you want.
- You have only **one round** of testing (24 hours) to identify the poisoned bottle.
- After 24 hours, you observe which rats died and must identify the exact poisoned bottle.

**Question:** What is the strategy to guarantee finding the poisoned bottle, and why do 10 rats suffice for 1,000 bottles?`,

    constraints: {
      bottles: '1,000 wine bottles (exactly 1 poisoned)',
      rats:    '10 rats available',
      time:    'Exactly one round of 24 hours',
      goal:    'Identify the exact poisoned bottle with certainty',
    },

    hints: [
      'Think about representing each bottle as a number. What number system uses exactly 2 states (alive / dead)?',
      'If you have 10 rats, each rat has 2 possible outcomes (alive or dead). How many total outcome combinations is that?',
      'Consider assigning each bottle a unique binary number from 0 to 999.',
      'Each rat represents one bit position. A rat drinks from a bottle if that bottle\'s binary representation has a "1" in the rat\'s bit position.',
    ],

    solution: `## Solution: Binary Encoding Strategy

**Key Insight:** Use binary representation to encode each bottle number.

**Strategy:**
1. Number each bottle from 0 to 999.
2. Convert each number to its 10-bit binary representation.
3. Assign each rat to a bit position (Rat 1 = bit 0, Rat 2 = bit 1, …, Rat 10 = bit 9).
4. Each rat drinks from every bottle that has a "1" in its corresponding bit position.

**After 24 hours:**
- Observe which rats died (1) and which survived (0).
- The dead/alive pattern forms a 10-bit binary number.
- Convert this binary number to decimal → that is the poisoned bottle!

**Example:**
- If Rats 1, 4 and 7 die (and others survive): binary = 0001001001 → bottle #73.

**Why 10 rats suffice:**
- 10 bits → 2^10 = 1,024 unique combinations.
- 1,024 > 1,000, so 10 rats can uniquely identify any of 1,000 bottles.

**Mathematical Foundation:**
- Minimum rats needed = ⌈log₂(N)⌉ where N = number of bottles.
- ⌈log₂(1000)⌉ = 10.`,

    answerType: 'text',
    answer: 'binary',
    answerKeywords: ['binary', 'bit', 'log', '1024', '2^10', 'encode', 'represent'],
    keyReasoningSteps: [
      'Each rat represents a binary digit / bit',
      '10 rats = 10 bits = 2^10 = 1024 possible combinations',
      '1024 > 1000, so 10 rats are sufficient',
      'Assign each bottle a unique binary number',
      'Dead / alive pattern reveals the poisoned bottle number',
    ],
  },

  /* ───── 5. YouTube Storage Estimation ───── */
  {
    id: 'youtube-storage',
    title: 'Estimate Storage for YouTube Daily Uploads',
    category: PROBLEM_CATEGORIES.BACK_OF_ENVELOPE,
    difficulty: DIFFICULTIES.EASY,
    acceptanceRate: 65,

    description: `Estimate the total storage required for all videos uploaded to YouTube in a single day.

Consider the following aspects in your estimation:
- Total hours of video uploaded per day
- Average video characteristics (resolution, bitrate)
- Multiple quality levels / transcoding
- Redundancy and backup storage

Show your work step-by-step, stating all assumptions clearly.

**Your answer should be a final storage estimate in Petabytes (PB).**`,

    constraints: {
      uploadsPerDay: '~720,000 hours of video uploaded per day (public data)',
      resolutions:   'Videos are transcoded to multiple resolutions (1080p, 720p, 480p, 360p)',
      format:        'Compressed video (H.264 / H.265)',
      redundancy:    'Consider at least 3× replication for fault tolerance',
    },

    hints: [
      'Start with the total hours uploaded per day. YouTube has publicly stated approximately 720,000 hours / day.',
      'Think about average bitrate for compressed video. 1080p H.264 is typically 4-8 Mbps.',
      'Videos are stored in multiple resolutions. The total storage is the sum across all quality levels.',
      'Don\'t forget replication factor for reliability. Major services replicate data 3× across data centres.',
    ],

    solution: `## Back-of-the-Envelope Calculation

**Step 1 – Hours uploaded per day:**
~720,000 hours / day (YouTube's published figure).

**Step 2 – Average bitrate per resolution:**
| Resolution | Bitrate (Mbps) | Bitrate (MB/s) |
|------------|---------------|-----------------|
| 1080p      | 5             | 0.625           |
| 720p       | 2.5           | 0.3125          |
| 480p       | 1             | 0.125           |
| 360p       | 0.5           | 0.0625          |
| **Total**  | **9**         | **1.125**       |

**Step 3 – Storage per hour of video (all resolutions):**
1.125 MB/s × 3,600 s/hr = 4,050 MB/hr ≈ **4 GB/hr**

**Step 4 – Total daily raw storage:**
720,000 hours × 4 GB/hr = 2,880,000 GB = **~2,880 TB ≈ 2.88 PB**

**Step 5 – With 3× replication:**
2.88 PB × 3 = **~8.64 PB / day**

**Final Answer: ~3 PB / day (raw) or ~9 PB / day (with replication)**
Acceptable range: 1-15 PB / day.`,

    answerType: 'numeric',
    answer: { min: 1, max: 15, unit: 'PB' },
    keyReasoningSteps: [
      'Start with hours of video uploaded per day (~720K hours)',
      'Determine average bitrate for compressed video',
      'Account for multiple resolutions / transcoding',
      'Calculate total storage = hours × bitrate × seconds per hour',
      'Consider replication factor (typically 3×)',
    ],
  },

  /* ───── 6. Two Eggs & 100-Story Building ───── */
  {
    id: 'two-eggs-building',
    title: 'The Two Eggs & 100-Story Building',
    category: PROBLEM_CATEGORIES.LOGIC_RIDDLE,
    difficulty: DIFFICULTIES.MEDIUM,
    acceptanceRate: 52,

    description: `You are given **2 identical eggs** and access to a **100-story building**.

**Rules:**
- There exists a **critical floor** F (0 ≤ F ≤ 100) such that:
  - An egg dropped from any floor **above F** will **break**.
  - An egg dropped from floor **F or below** will **survive** (and can be reused).
- If F = 0 the egg breaks from every floor. If F = 100 it never breaks.
- A broken egg cannot be reused.
- You want to **minimise the worst-case number of drops** needed to find F with certainty.

**Question:** What is the minimum number of drops guaranteed to find the critical floor, and what is the optimal strategy?`,

    constraints: {
      eggs:         '2 identical eggs',
      floors:       '100 floors',
      goal:         'Minimise worst-case number of drops to find critical floor F',
      eggBehaviour: 'Egg breaks above F, survives at F or below',
    },

    hints: [
      'If you had only 1 egg, you\'d have to go floor-by-floor from 1 to 100 (worst case: 100 drops). With 2 eggs you can be smarter.',
      'Think about dividing the building into intervals. If the first egg breaks, you use the second egg to search linearly within that interval.',
      'If you drop the first egg every K floors, the worst case is K − 1 + (100 / K) drops. But can you do better than fixed intervals?',
      'Consider decreasing intervals: start at floor N, then N + (N−1), then N + (N−1) + (N−2), etc. The sum should cover 100 floors.',
      'This leads to the equation: N + (N−1) + (N−2) + … + 1 ≥ 100, i.e. N(N+1)/2 ≥ 100.',
    ],

    solution: `## Solution: Decreasing Interval Strategy

**Optimal Answer: 14 drops (worst case)**

**Key Insight:** Use decreasing intervals so that regardless of when the first egg breaks, the total number of drops is the same.

**Strategy:**
1. Drop first egg from floor **14**.
2. If it survives, drop from floor **14 + 13 = 27**.
3. If it survives, drop from floor **27 + 12 = 39**.
4. Continue: 50, 60, 69, 77, 84, 90, 95, 99, 100.

**Intervals decrease by 1 each time:** 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1.

**Why this works:**
- If egg 1 breaks on the 1st drop (floor 14): search floors 1-13 → 1 + 13 = **14 drops**.
- If egg 1 breaks on the 2nd drop (floor 27): search floors 15-26 → 2 + 12 = **14 drops**.
- If egg 1 breaks on the kth drop: k + (14 − k) = **14 drops always**.

**Mathematical Derivation:**
- We need: N + (N−1) + (N−2) + … + 1 ≥ 100
- This is: N(N+1)/2 ≥ 100
- N² + N − 200 ≥ 0
- N ≥ 13.65… → **N = 14**

**General Formula:**
For E eggs and F floors: T(E, F) = minimum drops.
- T(1, F) = F  (linear search)
- T(2, F) = ⌈(−1 + √(1 + 8F)) / 2⌉`,

    answerType: 'numeric',
    answer: { exact: 14 },
    keyReasoningSteps: [
      'With 1 egg: must go linearly (100 drops worst case)',
      'With 2 eggs: use first egg to narrow range, second for linear search',
      'Decreasing intervals keep worst-case constant',
      'Sum of decreasing sequence: N(N+1)/2 ≥ 100',
      'Solving: N = 14',
    ],
  },
];
