import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { insertFile } from "lib/database";
import { pool } from 'lib/pool'

export const POST = withApiAuthRequired(async function (req) {
    const res = new Response();

    const { user } = await getSession(req, res);
    const userID = user.sub.split("|")[1];

    const searchParams = req.nextUrl.searchParams
    const isPublic = searchParams.get('is_public') == "true"

    const formData = await req.formData();
    const file = formData.get("file");
    const fileBuffer = await file.arrayBuffer();

    const dbRes = await insertFile(fileBuffer, file.name, userID, isPublic);
    const status = dbRes.error ? dbRes.status : 201;

    return new Response(JSON.stringify(dbRes), { status: status }, { res });
});

export const GET = (async function (req) {
    const session = await getSession(req);
    const userID = session?.user.sub.split("|")[1] || null;

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
            query += (params.length ? "AND " : "WHERE ") + "f_name = ? ";
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
