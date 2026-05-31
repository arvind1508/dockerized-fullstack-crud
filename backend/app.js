const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const redisClient = require("./redisClient");

const app = express();
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
});
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});


/**
 * @swagger
 * components:
 *   schemas:
 *     UserInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           example: Arvind Kumar
 *         email:
 *           type: string
 *           format: email
 *           example: arvind@example.com
 *     User:
 *       allOf:
 *         - $ref: '#/components/schemas/UserInput'
 *         - type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: User deleted
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
app.get("/users", async (req, res) => {
  const cacheKey = "users:all";
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    console.log("Serving from cache");
    return res.json(JSON.parse(cachedData));
  }
  
  const result = await pool.query("SELECT * FROM users ORDER BY id DESC");
  await redisClient.setex(cacheKey, 3600, JSON.stringify(result.rows)); // Cache for 1 hour
  res.json(result.rows);
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
app.post("/users", async (req, res) => {
  const { name, email } = req.body;

  const result = await pool.query(
    "INSERT INTO users(name, email) VALUES($1, $2) RETURNING *",
    [name, email]
  );

  await redisClient.del("users:all"); // Invalidate cache
  res.json(result.rows[0]);
});
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
app.put("/users/:id", async (req, res) => {
  const { name, email } = req.body;
  console.log("Updating user with ID:", req.params.id);
  const { id } = req.params;

  const result = await pool.query(
    "UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *",
    [name, email, id]
  );

  await redisClient.del("users:all"); // Invalidate cache
  res.json(result.rows[0]);
});
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 */
app.delete("/users/:id", async (req, res) => {
  await pool.query("DELETE FROM users WHERE id=$1", [req.params.id]);
  await redisClient.del("users:all"); // Invalidate cache
  res.json({ message: "User deleted" });
});
async function startServer() {
  await redisClient.connect();
  console.log("Redis connected");

  app.listen(5000, () => {
    console.log("Backend running on port 5000");
  });
}

startServer();
