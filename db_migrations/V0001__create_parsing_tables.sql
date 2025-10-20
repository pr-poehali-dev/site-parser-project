CREATE TABLE IF NOT EXISTS parsing_tasks (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    selector TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    total_items INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS parsed_items (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES parsing_tasks(id),
    title TEXT,
    content TEXT,
    link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parsed_items_task_id ON parsed_items(task_id);
CREATE INDEX IF NOT EXISTS idx_parsing_tasks_status ON parsing_tasks(status);
CREATE INDEX IF NOT EXISTS idx_parsing_tasks_created_at ON parsing_tasks(created_at DESC);