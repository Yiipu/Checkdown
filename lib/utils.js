import crypto from "crypto";
import { pool } from "./pool.js"

const algorithm = "aes-256-ctr";
const iv = crypto.randomBytes(16);

function processFileName(fileName) {
  return fileName
    .replace(/ /g, "-")
    .toLowerCase()
    .split(".")[0];
}

function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-256-ctr", process.env.AES_KEY, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
}

function decrypt(hash) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    process.env.AES_KEY,
    Buffer.from(hash.iv, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return decrpyted.toString();
}

async function getFile(fileID, userID) {
  try {
    const [file,] = await pool.execute(
      "SELECT f_name AS name, f as content FROM u_f_view WHERE f_id = ? AND (is_public = true OR u_id = ?);",
      [fileID, userID]
    );
    return file[0];
  } catch (err) {
    console.error(err);
    return null;
  }
}

export {
  processFileName,
  encrypt,
  decrypt,
  getFile
};
