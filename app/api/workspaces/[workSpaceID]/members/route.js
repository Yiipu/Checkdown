import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { pool } from "/lib/pool";

/**
 * @swagger
 * /api/workspaces/{workSpaceID}:
 *   delete:
 *     description: Leave a workspace
 *     parameters:
 *       - name: workSpaceID
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the workspace to leave
 *     responses:
 *       302:
 *         description: Successfully left the workspace and redirected
 *       500:
 *         description: Database error
 */
export const DELETE = withApiAuthRequired(async function (req, { params: { workSpaceID } }) {
  const res = new Response();
  const { user } = await getSession(req, res);
  const userID = user.sub;

  // try to leave workspace
  try {
    const sql =
      "DELETE FROM user_workspaces WHERE user_sub = ? AND workspace_id = ?"
    await pool.execute(sql, [userID, workSpaceID]);
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 500 });
  }

  return Response.redirect(new URL(`/`, req.url));
});

export const POST = withApiAuthRequired(async function (req, { params: { workSpaceID } }) {
  return new Response(null, { status: 501 });
});
