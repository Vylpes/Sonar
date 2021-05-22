CREATE TABLE users (
      id TEXT UNIQUE
    , email TEXT
    , username TEXT
    , password TEXT
    , verified BIT
    , admin BIT
    , active BIT
)