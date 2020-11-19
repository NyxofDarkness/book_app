DROP TABLE IF EXISTS books;

CREATE TABLE books(
id SERIAL PRIMARY KEY,
author TEXT,
title TEXT,
image_url VARCHAR(500),
description TEXT,
isbn VARCHAR(255)
);

