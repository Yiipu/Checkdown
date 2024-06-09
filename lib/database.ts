import { processFileName } from "./utils";
import { pool } from "./pool";

const sqlDict = {
  insertFile: "INSERT INTO mdx_files (file, file_name) VALUES (?, ?);",
  insertUserFile:
    "INSERT INTO user_files (user_sub, file_id, is_public) VALUES (?, ?, ?);"
};

export async function insertFile(
  fileBuffer: ArrayBuffer,
  fileName: String,
  userID: String,
  isPublic: Boolean
) {
  if (fileBuffer.byteLength > 16777215) {
    return { error: "File size too large." };
  }
  if (
    fileName.length > 255 ||
    !["mdx", "md"].includes(fileName.split(".")[1])
  ) {
    return { error: "File type not accepted" };
  }

  fileName = processFileName(fileName);

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const alreadyExists = await connection.execute(
        "SELECT 1 FROM u_f_view WHERE f_name = ? AND u_id = ?;",
        [fileName, userID]
      );
      //@ts-ignore
      if (alreadyExists[0].length) {
        return { error: "File already exists.", status: 409 };
      }
      await connection.execute(sqlDict.insertFile, [fileBuffer, fileName]);
      const fileID = (
        await connection.execute("SELECT LAST_INSERT_ID() as id;")
      )[0][0].id;
      await connection.execute(sqlDict.insertUserFile, [
        userID,
        fileID,
        isPublic,
      ]);
      await connection.commit();
      return { fileID: fileID, fileName: fileName };
    } catch (error) {
      await connection.rollback();
      console.error(error);
      return { error: "insert failed", status: 500 };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Failed to get connection", error);
  }
}
