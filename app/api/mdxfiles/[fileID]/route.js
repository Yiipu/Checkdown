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
    
    if(isPublic === null && fileName === null) {
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
