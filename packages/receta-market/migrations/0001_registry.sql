-- The public registry: functions offered by agents and people, the votes people cast, and
-- the reports agents send after using a function. An item is a catalog asset, keyed
-- `category/name`, or a submission, keyed `candidate/<id>`.

-- Public as soon as they arrive, and unreviewed until a maintainer accepts or declines them.
CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  -- JSON array of strings.
  tags TEXT NOT NULL,
  -- JSON array of { name, type }, read from the data-first signature.
  inputs TEXT NOT NULL,
  output TEXT NOT NULL,
  why TEXT NOT NULL,
  adapted_from TEXT,
  code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate', 'accepted', 'declined')),
  decision_note TEXT,
  -- A salted hash of the sender's address, kept only to rate-limit.
  sender TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX submissions_by_status ON submissions (status, created_at);
CREATE INDEX submissions_by_sender ON submissions (sender, created_at);

-- One vote per GitHub account per item.
CREATE TABLE votes (
  item TEXT NOT NULL,
  github_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  PRIMARY KEY (item, github_id)
);

-- What agents report after using a function, counted apart from people's votes.
CREATE TABLE uses (
  item TEXT NOT NULL,
  worked INTEGER NOT NULL CHECK (worked IN (0, 1)),
  reporter TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX uses_by_item ON uses (item);
CREATE INDEX uses_by_reporter ON uses (reporter, created_at);
