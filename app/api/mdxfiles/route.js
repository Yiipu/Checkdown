import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { insertFile } from "lib/database";
import { pool } from 'lib/pool'

/**
 * @swagger
 * /api/mdxfiles:
 *   post:
 *     description: Upload a file
 *     parameters:
 *       - name: is_public
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether the file is public or not
 *     requestBody:
 *       description: The file to upload.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                type: string
 *                format: binary
 *     responses:
 *       201:
 *         description: File created successfully
 *       400:
 *         description: Bad request. File is too large or file type not accepted
 *       409:
 *         description: Conflict. File with the same name and user already exists
 *       500:
 *         description: Server error
 */
export const POST = withApiAuthRequired(async function (req) {
    const res = new Response();

    const { user } = await getSession(req, res);
    const userID = user.sub;

    const searchParams = req.nextUrl.searchParams;
    const isPublic = searchParams.get('is_public') == 1;

    const formData = await req.formData();
    const file = formData.get("file");
    const fileBuffer = await file.arrayBuffer();

    const dbRes = await insertFile(fileBuffer, file.name, userID, isPublic);
    const status = dbRes.error ? dbRes.status : 201;

    return new Response(JSON.stringify(dbRes), { status: status }, { res });
});

/**
 * @swagger
 * /api/mdxfiles:
 *   get:
 *     description: Get a list of files
 *     parameters:
 *       - name: offset
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: The offset of the first item to return
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: The numbers of items to return
 *       - name: user_id
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: sub
 *         description: The user ID
 *       - name: file_name
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: The file name to fuzzy search for
 *       - name: is_public
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: filter by public files, when not specified, return all files if user is owner
 *                      else return only public files
 *     responses:
 *       200:
 *         description: A list of files
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
 *                       id:
 *                         type: string
 *                       public:
 *                         type: boolean
 *       404:
 *         description: No files found
 *       500:
 *         description: Server error
 */
export const GET = (async function (req) {
    const session = await getSession(req);
    const userID = session?.user.sub || null;

    const res = new Response();

    const searchParams = req.nextUrl.searchParams;
    const offset = searchParams.get('offset');
    const limit = searchParams.get('limit');
    const pathUserID = searchParams.get('user_id');
    const fileName = searchParams.get('file_name');

    const isOwner = userID == pathUserID;

    /* filter by is_public
    * if is_public is not specified, 
    * then return all files if user is owner,
    * else return only public files
    */
    const isPublic = searchParams.get('is_public') == null ?
        (isOwner ? null : true) : searchParams.get('is_public') == "true";

    if (!isOwner && isPublic === false) {
        return new Response(null, { status: 403 }, res);
    }

    try {
        let query = "SELECT f_name AS name, f_id AS id , is_public AS public FROM u_f_view ";
        let params = [];

        if (isPublic !== null) {
            query += "WHERE is_public = ? ";
            params.push(isPublic);
        }
        if (pathUserID !== null) {
            query += (params.length ? "AND " : "WHERE ") + "u_id = ? ";
            params.push(pathUserID);
        }
        if (fileName !== null) {
            query += (params.length ? "AND " : "WHERE ") + "MATCH(f_name) AGAINST(?)"
            params.push(fileName);
        }

        query += "LIMIT ?, ?;";
        params.push(offset || "0", limit || "100");

        const [fileList,] = await pool.execute(query, params);
        const status = fileList.length == 0 ? 404 : 200;
        return Response.json({ data: fileList }, { status: status }, { res });
    } catch (err) {
        console.error(err);
        return new Response(null, { status: 500 }, { res });
    }
});
