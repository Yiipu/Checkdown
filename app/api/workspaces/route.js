import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { pool, handleTransaction } from "/lib/pool";

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     description: Create a new workspace
 *     parameters:
 *       - name: file_id
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the file to create a workspace for
 *     responses:
 *       201:
 *         description: Successfully created the workspace
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 workSpaceID:
 *                   type: string
 *       500:
 *         description: Database error
 */
export const POST = withApiAuthRequired(async function (req) {
    const res = new Response();
    const { user } = await getSession(req, res);
    const userID = user.sub;
    const fileID = req.nextUrl.searchParams.get("file_id");

    try {
        const dbRes = await handleTransaction(async (connection) => {
            await connection.execute("INSERT INTO workspaces (file_id) VALUES (?);", [fileID]);
            const [[{ id: workSpaceID }]] = await connection.query("SELECT LAST_INSERT_ID() as id;");
            await connection.execute(
                "INSERT INTO user_workspaces (user_sub, workspace_id, privilege) VALUES (?, ?, ?);",
                [userID, workSpaceID, "manager"]
            );
            // file popularity + 1
            await connection.execute(
                "UPDATE mdx_files SET popularity = popularity + 1 WHERE id = ?;",
                [fileID]
            );
            return { workSpaceID };
        });

        return new Response(JSON.stringify(dbRes), { status: 201 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "database error" }), { status: 500 });
    }
});

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     description: Get workspaces
 *     parameters:
 *       - name: file_id
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: The ID of the file to get workspaces for
 *     responses:
 *       200:
 *         description: A list of workspaces
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       time_created:
 *                         type: string
 *                       privilege:
 *                         type: string
 *                       file_name:
 *                         type: string
 *       500:
 *         description: Database error
 */
export const GET = withApiAuthRequired(async function (req) {
    const { user } = await getSession(req);
    const userID = user.sub;

    const searchParams = req.nextUrl.searchParams;
    const fileID = searchParams.get('file_id');

    try {
        let query = "SELECT id, created AS time_created, privilege, f_name AS file_name, f_id AS file_id FROM w_uw_view ";
        let params = [];

        if (fileID !== null) {
            query += "WHERE f_id = ? ";
            params.push(fileID);
        }

        query += params.length ? "AND u_id = ?;" : "WHERE u_id = ?;";
        params.push(userID);

        const [workspaces,] = await pool.execute(query, params);
        return Response.json({ data: workspaces }, { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response(null, { status: 500 });
    }
});
