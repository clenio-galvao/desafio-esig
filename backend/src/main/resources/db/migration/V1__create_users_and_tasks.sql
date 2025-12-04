CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    roles       VARCHAR(255)    NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id           BIGSERIAL       PRIMARY KEY,
    title        VARCHAR(200)    NOT NULL,
    description  TEXT,
    responsible  VARCHAR(150)    NOT NULL,
    priority     VARCHAR(20)     NOT NULL,
    deadline     DATE            NOT NULL,
    status       VARCHAR(20)     NOT NULL,
    user_id      BIGINT          REFERENCES users (id),
    created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks (priority);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks (deadline);


