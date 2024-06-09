export function processFileName(fileName) {
  fileName = fileName.replace(/ /g, "-");
  fileName = fileName.toLowerCase();
  fileName = fileName.split(".")[0];
  return fileName;
}

import crypto from "crypto";
const algorithm = "aes-256-ctr";
const iv = crypto.randomBytes(16);
export function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-256-ctr", process.env.AES_KEY, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
}

export function decrypt(hash) {
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

// note: cache in react is experimental
// import { cache } from "react";
import { pool } from "./pool.js"

export const getFile =
  // cache(
  async (fileID, userID) => {
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
// );
