CREATE TABLE User (
      Id VARCHAR(36) UNIQUE
    , Email TEXT
    , Username TEXT
    , Password TEXT
    , Verified BIT
    , Admin BIT
    , Active BIT
    , PRIMARY KEY (Id)
)