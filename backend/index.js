const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();


const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

app.use(bodyParser.json());

// PostgreSQL Connection Pool
const pool = new Pool({
    user: 'myuser',
    host: 'localhost',
    database: 'ioi_face',
    password: 'postgres',
    port: 5432,
});




const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
