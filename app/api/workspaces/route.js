import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { pool } from "/lib/pool";

export const POST = withApiAuthRequired(async function (req) {
    const res = new Response();
    const { user } = await getSession(req, res);
    const userID = user.sub.split("|")[1];

    const searchParams = req.nextUrl.searchParams;
    const fileID = searchParams.get("file_id");

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        await connection.execute("INSERT INTO workspaces (file_id) VALUES (?);", [fileID]);
        const workSpaceID =
            (await connection.query("SELECT LAST_INSERT_ID() as id;"))[0][0].id;
        await connection.execute(
            "INSERT INTO user_workspaces (user_sub, workspace_id, privilege) VALUES (?, ?, ?);",
            [
                userID,
                workSpaceID,
                "manager",
            ]);
        await connection.commit();
        connection.release();
        return new Response(JSON.stringify({ workSpaceID: workSpaceID }), { status: 201 });
    } catch (error) {
        console.error(error);
        await connection.rollback();
        connection.release();
        return new Response(JSON.stringify({ error: "database error" }), { status: 500 });
    }
});

export const DELETE = withApiAuthRequired(async function (req) {
    const res = new Response();
    const { user } = await getSession(req, res);
    const userID = user.sub.split("|")[1];

    const formData = await req.formData();
    const workSpaceID = formData.get("workSpaceID");

    try {
        const [privilege,] = await pool.execute(
            "SELECT privilege FROM user_workspaces WHERE user_sub = ? AND workspace_id = ?;",
            [userID, workSpaceID]
        );
        if (privilege[0].privilege !== "manager") {
            return new Response(JSON.stringify({ error: "permission denied" }), { status: 403 });
        }
        await pool.execute("DELETE FROM progresses WHERE workspace_id = ?;", [workSpaceID]);
        await pool.execute("DELETE FROM user_workspaces WHERE workspace_id = ?;", [workSpaceID]);
        await pool.execute("DELETE FROM workspaces WHERE id = ?;", [workSpaceID]);
        return new Response(JSON.stringify({}), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "database error" }), { status: 500 });
    }
})

export const GET = withApiAuthRequired(async function (req) {
    const { user } = await getSession(req);
    const userID = user.sub.split("|")[1];

    const searchParams = req.nextUrl.searchParams;
    const fileID = searchParams.get('file_id');

    try {
        let query = "SELECT id, created AS time_created, privilege, f_name AS file_name FROM w_uw_view ";
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
