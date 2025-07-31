-- Create the files table
CREATE TABLE IF NOT EXISTS functions (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    knowledge VARCHAR(36)[],
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
    results VARCHAR(36)[]
);

CREATE TABLE IF NOT EXISTS results (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solution UUID REFERENCES solutions(uuid),
    runtime INT,
    num_of_solutions INT,
    data JSONB NOT NULL
);