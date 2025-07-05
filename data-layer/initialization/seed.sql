-- Create the files table
CREATE TABLE IF NOT EXISTS files (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ts_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ts_updated TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    ts_deleted TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    filename VARCHAR(255) NOT NULL,
    filetype VARCHAR(50) NOT NULL,
    filesize BIGINT NOT NULL,
    content TEXT NOT NULL
);