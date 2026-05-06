CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'uk_users_email'
    ) THEN
        ALTER TABLE users
            ADD CONSTRAINT uk_users_email UNIQUE (email);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'users'
          AND column_name = 'id'
          AND udt_name = 'int8'
    ) THEN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS id_uuid UUID;

        UPDATE users
           SET id_uuid = gen_random_uuid()
         WHERE id_uuid IS NULL;

        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;
        ALTER TABLE users DROP COLUMN IF EXISTS id;
        ALTER TABLE users RENAME COLUMN id_uuid TO id;
        ALTER TABLE users ALTER COLUMN id SET NOT NULL;
        ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
        ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
    END IF;
END $$;
