import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { handleTransaction } from "/lib/pool";

/**
 * @swagger
 * /api/workspaces/{workSpaceID}:
 *   delete:
 *     description: Delete a workspace
 *     parameters:
 *      - name: workSpaceID
 *        in: path
 *        required: true
 *        schema:
 *          type: integer
 *        description: The ID of the workspace to delete
 *     responses:
 *       200:
 *         description: Successfully deleted the workspace
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Database error
 */
export const DELETE = withApiAuthRequired(async function (req, { params: { workSpaceID } }) {
    const res = new Response();
    const { user } = await getSession(req, res);
    const userID = user.sub;

    try {
        await handleTransaction(async (connection) => {
            const [privilege,] = await connection.execute(
                "SELECT privilege FROM user_workspaces WHERE user_sub = ? AND workspace_id = ?;",
                [userID, workSpaceID]
            );
            if (privilege[0].privilege !== "manager") {
                return new Response(JSON.stringify({ error: "permission denied" }), { status: 403 });
            }
            await connection.execute("DELETE FROM progresses WHERE workspace_id = ?;", [workSpaceID]);
            await connection.execute("DELETE FROM user_workspaces WHERE workspace_id = ?;", [workSpaceID]);
            await connection.execute("DELETE FROM workspaces WHERE id = ?;", [workSpaceID]);
        });
        return new Response(JSON.stringify({}), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "database error" }), { status: 500 });
    }
})