import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { pool } from "/lib/pool";

export const DELETE = withApiAuthRequired(async function (req, { params: { workSpaceID } }) {
  const res = new Response();
  const { user } = await getSession(req, res);
  const userID = user.sub.split("|")[1];

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
