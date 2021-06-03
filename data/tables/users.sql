CREATE TABLE users (
      id VARCHAR(36) UNIQUE
    , email TEXT
    , username TEXT
    , password TEXT
    , verified BIT
    , admin BIT
    , active BIT
)