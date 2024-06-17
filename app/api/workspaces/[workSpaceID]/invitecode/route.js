import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { pool } from "/lib/pool";

/**
 * @swagger
 * /api/workspaces/{workSpaceID}/invitecode:
 *   put:
 *     description: Update a workspace's invite code
 *     parameters:
 *       - name: workSpaceID
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the workspace to update
 *     responses:
 *       200:
 *         description: Successfully updated the invite code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *       403:
 *         description: User is not a manager
 *       500:
 *         description: Database error
 *       404:
 *         description: Workspace not found
 */
export const PUT = withApiAuthRequired(async function (req, { params: { workSpaceID } }) {
  const res = new Response();
  const { user } = await getSession(req, res);
  const userID = user.sub;

  // check if user is manager
  try {
    const sql =
      "SELECT privilege FROM user_workspaces WHERE user_sub = ? AND workspace_id = ?;";
    const [privilege] = await pool.execute(sql, [userID, workSpaceID]);
    if (privilege.length == 0) {
      return new Response(null, { status: 404 });
    }
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

/**
 * @swagger
 * /api/workspaces/{workSpaceID}/invitecode:
 *   delete:
 *     description: Delete a workspace's invite code
 *     parameters:
 *       - name: workSpaceID
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the workspace to update
 *     responses:
 *       200:
 *         description: Successfully deleted the invite code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *       403:
 *         description: User is not a manager
 *       500:
 *         description: Database error
 */
export const DELETE = withApiAuthRequired(async function (req, { params: { workSpaceID } }) {
  const res = new Response();
  const { user } = await getSession(req, res);
  const userID = user.sub;

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
  const userID = user.sub;

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
