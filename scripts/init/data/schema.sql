-- Create the files table
CREATE TABLE IF NOT EXISTS functions (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    options VARCHAR(36)[]
);

CREATE TABLE IF NOT EXISTS options (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    knowledge VARCHAR(36)[]
);

CREATE TABLE IF NOT EXISTS knowledge_items (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    size INT,
    type TEXT,
    url TEXT,
    content TEXT,
    length INT
);

CREATE TABLE IF NOT EXISTS solution_spaces (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    functions VARCHAR(36)[]
);

CREATE TABLE IF NOT EXISTS solutions (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solution_space UUID REFERENCES solution_spaces(uuid),
    name TEXT NOT NULL,
    req_customer TEXT,
    req_business TEXT,
    runtime INT,
    data JSONB
);

CREATE TYPE kpi_type AS ENUM ('qualitative', 'quantitative');

CREATE TABLE IF NOT EXISTS kpis (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type kpi_type NOT NULL,
    value TEXT NOT NULL
);