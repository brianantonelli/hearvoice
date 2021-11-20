CREATE TABLE words (
	word_id INT GENERATED ALWAYS AS IDENTITY,
	word VARCHAR ( 50 ) UNIQUE NOT NULL,
  occurrences INTEGER NOT NULL,
  heard_on DATE,
  PRIMARY KEY(word_id, heard_on)
);