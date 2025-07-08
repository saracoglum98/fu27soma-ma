-- Create the files table
CREATE TABLE IF NOT EXISTS functions (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    knowledge VARCHAR(32)[],
    options VARCHAR(32)[]
);

CREATE TABLE IF NOT EXISTS options (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    knowledge VARCHAR(32)[]
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
    functions VARCHAR(32)[],
    results VARCHAR(32)[]
);

CREATE TABLE IF NOT EXISTS solutions (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    input_customer TEXT,
    input_business TEXT,
    results VARCHAR(32)[] NOT NULL
);

CREATE TABLE IF NOT EXISTS results (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    map JSONB NOT NULL
);