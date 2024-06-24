import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const createPool = () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 10,
    });
    return pool;
  } catch (error) {
    console.log(`Could not connect - ${error}`);
    return null;
  }
};

const pool = createPool();

async function handleTransaction(fn) {
  const connection = await pool.getConnection()
    .catch((err) => {
      console.error(err);
      throw new Error("Failed to get connetion");
    });
  try {
    await connection.beginTransaction();
    await fn(connection);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error(error);
    throw new Error("Transaction failed");
  } finally {
    connection.release();
  }
}

export { pool, handleTransaction };
