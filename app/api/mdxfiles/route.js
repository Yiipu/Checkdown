import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { pool, handleTransaction } from 'lib/pool'

import emitter from "lib/eventBus";

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
    const isPublic = req.nextUrl.searchParams.get('is_public') == "true" ? 1 : 0;
    const formData = await req.formData();
    const file = formData.get("file");
    const fileBuffer = await file.arrayBuffer();

    try {
        const dbRes = await handleTransaction(async (connection) => {
            // Validate file size and type
            if (fileBuffer.byteLength > 16777215) throw new Error("File size too large.");
            if (!["mdx", "md"].includes(file.name.split(".").pop())) throw new Error("File type not accepted");

            // Check if file already exists
            const [alreadyExists] = await connection.execute("SELECT 1 FROM u_f_view WHERE f_name = ? AND u_id = ?;", [file.name, userID]);
            if (alreadyExists.length) throw new Error("File already exists.");

            // Insert file and user_file records
            await connection.execute("INSERT INTO mdx_files (file, file_name) VALUES (?, ?);", [fileBuffer, file.name]);
            const [[{ id: fileID }]] = await connection.execute("SELECT LAST_INSERT_ID() as id;");
            await connection.execute("INSERT INTO user_files (user_sub, file_id, is_public) VALUES (?, ?, ?);", [userID, fileID, isPublic]);

            if (isPublic) {
                setTimeout(() => emitter.emit('LangTaskRequired', fileID), Math.floor(Math.random() * 10000));
            }

            return { fileID, fileName: file.name };
        });
        return new Response(JSON.stringify(dbRes), { status: 201 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message, status: 500 }), { status: 500 });
    }
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
        (isOwner ? null : true) : searchParams.get('is_public') == "true" || 1;

    if (!isOwner && isPublic === false) {
        return new Response(null, { status: 403 }, res);
    }

    try {
        let query = "SELECT u_f_view.u_id AS user_id, u_f_view.f_name AS name, u_f_view.f_id AS id, u_f_view.is_public AS public, u_f_view.description, mdx_files.popularity ";
        query += "FROM u_f_view JOIN mdx_files ON u_f_view.f_id = mdx_files.id ";

        let params = [];

        if (isPublic !== null) {
            query += "WHERE u_f_view.is_public = ? ";
            params.push(isPublic);
        }
        if (pathUserID !== null) {
            query += (params.length ? "AND " : "WHERE ") + "u_f_view.u_id = ? ";
            params.push(pathUserID);
        }
        if (fileName !== null) {
            query += (params.length ? "AND " : "WHERE ") + "MATCH(u_f_view.f_name) AGAINST(?) ";
            params.push(fileName);
        }

        query += "ORDER BY mdx_files.popularity DESC ";

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
