import mysql from "mysql2/promise";
import { processFileName } from "./utils";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const sqlDict = {
  insertFile: "INSERT INTO mdx_files (file, file_name) VALUES (?, ?);",
  insertUserFile:
    "INSERT INTO user_files (user_sub, file_id, is_public) VALUES (?, ?, ?);",
  selectUser: "SELECT sub FROM users WHERE sub = ?;",
  selectFile:
    "SELECT f, f_id, is_public FROM u_f_view WHERE u_id = ? AND f_name = ?;",
  insertWorkSpace: "INSERT INTO workspaces (file_id) VALUES (?);",
  insertUserWorkSpace:
    "INSERT INTO user_workspaces (user_sub, workspace_id, privilege) VALUES (?, ?, ?);",
  selectWorkSpace:
    "SELECT id, created, privilege FROM w_uw_view WHERE u_id = ? AND f_id = ?;",
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
        return { error: "File already exists." };
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
      console.log(error);
      return { error: "insert failed" };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.log("Failed to get connection", error);
  }
}

// TODO: add para userID_requester to check if the user has access to the file
export async function getFile(fileName: String, userID: String) {
  try {
    const [rows, fields] = await pool.execute(sqlDict.selectFile, [
      userID,
      fileName,
    ]);
    // @ts-ignore
    if (rows.length) {
      return rows[0]; // { f: ..., f_id: ... , is_public: ...}
    } else {
      return { error: "no result" };
    }
  } catch (e) {
    console.log(e);
    return { error: "select failed" };
  }
}

export async function createWorkSpace(fileID: Number, userID: String) {
  const connection = await pool.getConnection();
  let workSpaceID = 0;
  try {
    await connection.execute(sqlDict.insertWorkSpace, [fileID]);
    workSpaceID =
      //@ts-ignore
      (await connection.query("SELECT LAST_INSERT_ID() as id;"))[0][0].id;
    console.log("workSpaceID", workSpaceID);
    await connection.execute(sqlDict.insertUserWorkSpace, [
      userID,
      workSpaceID,
      "manager",
    ]);
    await connection.commit();
  } catch (error) {
    console.log(error);
    await connection.rollback();
    return { error: "insert failed" };
  } finally {
    connection.release();
  }
  console.log("workSpaceID", workSpaceID);
  return { workSpaceID: workSpaceID };
}

export async function listFileWorkSpace(fileID: Number, userID: String) {
  try {
    const [rows, fields] = await pool.execute(sqlDict.selectWorkSpace, [
      userID,
      fileID,
    ]);
    // @ts-ignore
    if (rows.length) {
      return rows; // { id: ..., created: ..., privilege: ... }[]
    } else {
      return { error: "no result" };
    }
  } catch (e) {
    console.log(e);
    return { error: "select failed" };
  }
}

export async function listUserFiles(userID: String) {
  try {
    const [rows, fields] = await pool.execute(
      "SELECT f_name, is_public FROM u_f_view WHERE u_id = ?;",
      [userID]
    );
    // @ts-ignore
    return rows; // { f_name: ..., is_public: ... }[]
  } catch (e) {
    console.log(e);
    return { error: "select failed" };
  }
}

export async function listUserWorkSpaces(userID: String) {
  try {
    const [rows, fields] = await pool.execute(
      "SELECT id, created, privilege, f_name FROM w_uw_view WHERE u_id = ?;",
      [userID]
    );
    // @ts-ignore
    return rows; // { id: ..., created: ..., privilege: ..., f_name: ... }[]
  } catch (e) {
    console.log(e);
    return { error: "select failed" };
  }
}

export async function getWorkSpaceContent(workSpaceID: Number, userID: String) {
  try {
    const [rows, fields] = await pool.execute(
      "SELECT created, privilege, f_id, f_name FROM w_uw_view WHERE id = ? AND u_id = ?;",
      [workSpaceID, userID]
    );
    // @ts-ignore
    return rows; // { created: ..., privilege: ..., f_id: ..., f_name: ... }[]
  } catch (e) {
    console.log(e);
    return { error: "select failed" };
  }
}
