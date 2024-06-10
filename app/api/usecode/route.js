import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { pool } from 'lib/pool'

/**
 * @swagger
 * /api/usecode:
 *   post:
 *     description: Join a workspace
 *     parameters:
 *       - name: code
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: The invite code of the workspace to join
 *     responses:
 *       201:
 *         description: Successfully joined the workspace
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *       404:
 *         description: Workspace not found
 *       500:
 *         description: Server error
 */
export const POST = withApiAuthRequired(async function (req) {
    const res = new Response();

    const { user } = await getSession(req, res);
    const userID = user.sub.split("|")[1];

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');

    try {
        const [workspace,] = await pool.execute("SELECT id FROM workspaces WHERE invite_code = ? AND code_expire_at > NOW();", [code]);
        if (!workspace.length) {
            return new Response(null, { status: 404 }, res);
        }
        const workSpaceID = workspace[0].id;
        await pool.execute(
            "INSERT INTO user_workspaces (user_sub, workspace_id, privilege) " +
            "VALUES (?, ?, 'partner') " +
            "ON DUPLICATE KEY UPDATE user_sub=user_sub;",
            [userID, workSpaceID]);

        return Response.json({ id: workSpaceID }, { status: 201 }, res);
    } catch (err) {
        console.error(err);
        return new Response(null, { status: 500 }, res);
    }
});