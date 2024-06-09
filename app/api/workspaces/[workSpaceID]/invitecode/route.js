import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { pool } from "/lib/pool";

export const PUT = withApiAuthRequired(async function (req, { params: { workSpaceID } }) {
  const res = new Response();
  const { user } = await getSession(req, res);
  const userID = user.sub.split("|")[1];

  // check if user is manager
  try {
    const sql =
      "SELECT privilege FROM user_workspaces WHERE user_sub = ? AND workspace_id = ?;";
    const [privilege] = await pool.execute(sql, [userID, workSpaceID]);
    if (privilege.length && privilege[0].privilege != "manager") {
      return new Response(null, { status: 403 });
    }
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 500 });
  }

  const code = Math.random().toString(36).substring(2, 8);

  try {
    const sql =
      "UPDATE workspaces SET invite_code = ?, code_expire_at = DATE_ADD(NOW(), INTERVAL 1 DAY) " +
      "WHERE id = ?;";
    await pool.execute(sql, [code, workSpaceID]);
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 500 });
  }

  return Response.json({ code: code });
});

export const DELETE = withApiAuthRequired(async function (req, { params: { workSpaceID } }) {
  const res = new Response();
  const { user } = await getSession(req, res);
  const userID = user.sub.split("|")[1];

  // check if user is manager
  try {
    const sql =
      "SELECT privilege FROM user_workspaces WHERE user_sub = ? AND workspace_id = ?;";
    const [privilege] = await pool.execute(sql, [userID, workSpaceID]);
    if (privilege.length && privilege[0].privilege != "manager") {
      return new Response(null, { status: 403 });
    }
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 500 });
  }

  const code = Math.random().toString(36).substring(2, 8);

  try {
    const sql =
      "UPDATE workspaces SET invite_code = null, code_expire_at = null " +
      "WHERE id = ?;";
    await pool.execute(sql, [workSpaceID]);
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 500 });
  }

  return Response.json({ code: code });
});

export const GET = withApiAuthRequired(async function (req, { params: { workSpaceID } }) {
  const res = new Response();
  const { user } = await getSession(req, res);
  const userID = user.sub.split("|")[1];

  // check if user is manager
  try {
    const sql =
      "SELECT privilege FROM user_workspaces WHERE user_sub = ? AND workspace_id = ?;";
    const [privilege] = await pool.execute(sql, [userID, workSpaceID]);
    if (privilege.length && privilege[0].privilege != "manager") {
      return new Response(null, { status: 403 });
    }
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 500 });
  }

  try {
    const sql =
      "SELECT invite_code, code_expire_at FROM workspaces WHERE id = ?;";
    const [code] = await pool.execute(sql, [workSpaceID]);
    return Response.json({ code: code[0].invite_code, expire_at: code[0].code_expire_at });
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 500 });
  }
});
