import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { pool } from "/lib/pool";
import { NextResponse } from 'next/server'

export const GET = withApiAuthRequired(async function (
    req,
    { params: { code } }
) {
    const res = new Response();
    const { user } = await getSession(req, res);
    const userID = user.sub.split("|")[1];

    // get workspace id
    var workspaceID;
    try {
        const sql = "SELECT id FROM workspaces WHERE invite_code = ? AND code_expire_at > NOW();";
        const [workspace,] = await pool.execute(sql, [code]);
        if (!workspace.length) {
            return new Response(null, { status: 404 });
        }
        workspaceID = workspace[0].id;
    } catch (err) {
        console.error(err);
        return new Response(null, { status: 500 });
    }

    // try to join workspace
    try {
        const sql =
            "INSERT INTO user_workspaces (user_sub, workspace_id, privilege) " +
            "VALUES (?, ?, 'partner') " +
            "ON DUPLICATE KEY UPDATE user_sub=user_sub;";
        await pool.execute(sql, [userID, workspaceID]);
    } catch (err) {
        console.error(err);
        return new Response(null, { status: 500 });
    }

    // redirect to workspace
    return NextResponse.redirect(new URL(`/workspace/${workspaceID}`, req.url))
});