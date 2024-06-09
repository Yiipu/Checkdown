import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { pool } from 'lib/pool'

export const PATCH = withApiAuthRequired(async function (req, { params: { fileID } }) {
    const res = new Response();

    const { user } = await getSession(req, res);
    const userID = user.sub.split("|")[1];

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

export const GET = async function (req, { params: { fileID } }) {
    const res = new Response();

    const session = await getSession(req, res);
    const userID = session?.user.sub.split("|")[1] || null;

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
