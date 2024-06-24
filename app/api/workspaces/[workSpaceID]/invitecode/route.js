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

  try {
    // Check if user is manager
    const [privileges] = await pool.execute(
      "SELECT privilege FROM user_workspaces WHERE user_sub = ? AND workspace_id = ?;",
      [userID, workSpaceID]
    );

    if (privileges.length === 0) return new Response(null, { status: 404 });
    if (privileges[0].privilege !== "manager") return new Response(null, { status: 403 });

    // Generate and update invite code
    const code = Math.random().toString(36).substring(2, 8);
    await pool.execute(
      "UPDATE workspaces SET invite_code = ?, code_expire_at = DATE_ADD(NOW(), INTERVAL 1 DAY) WHERE id = ?;",
      [code, workSpaceID]
    );

    return Response.json({ code });
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 500 });
  }
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

  try {
    // Check if user is manager
    const [privileges] = await pool.execute(
      "SELECT privilege FROM user_workspaces WHERE user_sub = ? AND workspace_id = ?;",
      [userID, workSpaceID]
    );

    if (privileges.length === 0 || privileges[0].privilege !== "manager") {
      return new Response(null, { status: 403 });
    }

    // Clear invite code and expiration
    await pool.execute(
      "UPDATE workspaces SET invite_code = null, code_expire_at = null WHERE id = ?;",
      [workSpaceID]
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 500 });
  }
});

export const GET = withApiAuthRequired(async function (req, { params: { workSpaceID } }) {
  const res = new Response();
  const { user } = await getSession(req, res);
  const userID = user.sub;

  try {
    // Check if user is manager and get invite code in one go
    const sql = `
      SELECT uw.privilege, w.invite_code, w.code_expire_at
      FROM user_workspaces uw
      JOIN workspaces w ON uw.workspace_id = w.id
      WHERE uw.user_sub = ? AND uw.workspace_id = ?;
    `;
    const [results] = await pool.execute(sql, [userID, workSpaceID]);

    if (results.length === 0) return new Response(null, { status: 404 });
    if (results[0].privilege !== "manager") return new Response(null, { status: 403 });

    return Response.json({ code: results[0].invite_code, expire_at: results[0].code_expire_at });
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 500 });
  }
});