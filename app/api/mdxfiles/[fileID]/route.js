import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { pool } from 'lib/pool'

/**
 * @swagger
 * /api/mdxfiles/{fileID}:
 *   patch:
 *     description: Update a file
 *     parameters:
 *       - name: fileID
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the file to update
 *       - name: is_public
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: set the file to public or private
 *       - name: name
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: The new name of the file
 *     responses:
 *       200:
 *         description: File updated successfully
 *       400:
 *         description: No parameters provided
 *       403:
 *         description: User does not have the privilege to update the file
 *       500:
 *         description: Server error
 */
export const PATCH = withApiAuthRequired(async function (req, { params: { fileID } }) {
    const res = new Response();

    const { user } = await getSession(req, res);
    const userID = user.sub;

    const searchParams = req.nextUrl.searchParams
    const isPublic = searchParams.get('is_public') == null ?
        null : searchParams.get('is_public') == "true";
    const fileName = searchParams.get('name')

    if (isPublic === null && fileName === null) {
        return new Response(null, { status: 400 }, res);
    }

    try {
        const [privilege,] = await pool.execute(
            "SELECT privilege FROM u_f_view WHERE f_id = ? AND u_id = ?;",
            [fileID, userID]
        );
        if (privilege[0].privilege !== "owner") {
            return new Response(null, { status: 403 }, res);
        }
        await pool.execute(
            "UPDATE u_f_view SET f_name = IFNULL(?, f_name), is_public = IFNULL(?, is_public) WHERE f_id = ?;",
            [fileName, isPublic, fileID]
        );
        return new Response(null, { status: 200 }, res);
    } catch (err) {
        console.error(err);
        return new Response(null, { status: 500 }, res);
    }
});

/**
 * @swagger
 * /api/mdxfiles/{fileID}:
 *   get:
 *     description: Get a file
 *     parameters:
 *       - name: fileID
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the file to get
 *     responses:
 *       200:
 *         description: A file
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
 *                       name:
 *                         type: string
 *                       content:
 *                         type: string
 *       404:
 *         description: File not found, or user does not have the privilege to access the file
 *       500:
 *         description: Server error
 */
export const GET = async function (req, { params: { fileID } }) {
    const res = new Response();

    const session = await getSession(req, res);
    const userID = session?.user.sub || null;

    try {
        const [file,] = await pool.execute(
            "SELECT f_name AS name, f as content FROM u_f_view WHERE f_id = ? AND (is_public = true OR u_id = ?);",
            [fileID, userID]
        );
        const status = file.length == 0 ? 404 : 200;
        return new Response({ data: file }, { status: status }, { res });
    } catch (err) {
        console.error(err);
        return new Response(null, { status: 500 }, { res });
    }
};

async function handleTransaction(pool, fn) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await fn(connection);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        console.error(error);
    } finally {
        connection.release();
    }
}

const handleErrors = (fn) => async function (...args) {
    try {
        return await fn(...args);
    } catch (error) {
        console.error(error);
        return new Response(null, { status: 500 }, res);
    }
}

export const DELETE = withApiAuthRequired(handleErrors(async function (req, { params: { fileID } }) {
    const res = new Response();

    const { user } = await getSession(req, res);
    const userID = user.sub;

    const [privilege,] = await pool.execute(
        "SELECT 1 FROM u_f_view WHERE f_id = ? AND u_id = ?;",
        [fileID, userID]
    );
    if (privilege.length == 0) {
        return new Response(null, { status: 403 }, res);
    }

    await handleTransaction(pool, async (connection) => {

        const [wsIDs,] = await connection.execute(
            "SELECT id FROM workspaces WHERE file_id = ?;",
            [fileID]
        );

        const sqlIN = wsIDs.map(() => '?').join(',');
        const wsIDList = wsIDs.map(ws => ws.id);

        await connection.execute(
            `DELETE FROM user_workspaces WHERE workspace_id IN (${sqlIN});`,
            wsIDList
        );
        await connection.execute(
            `DELETE FROM progresses WHERE workspace_id IN (${sqlIN});`,
            wsIDList
        );
        await connection.execute(
            `DELETE FROM workspaces WHERE id IN (${sqlIN});`,
            wsIDList
        );

        await connection.execute(
            "DELETE FROM user_files WHERE file_id = ?;",
            [fileID]
        );
        await connection.execute(
            "DELETE FROM mdx_files WHERE id = ?;",
            [fileID]
        );

    });

    return new Response(null, { status: 200 }, res);
}));
