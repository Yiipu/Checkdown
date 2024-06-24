import { pool } from "lib/pool";
import { getDictionary } from "lib/dictionaries";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { notFound } from 'next/navigation';
import { MDXRemote } from "next-mdx-remote/rsc";
import { customMDX } from "./components/mdx/custommdx";
import { SocketProvider } from "./components/socket/socketprovider";
import { encrypt } from "lib/utils";
import { ShareCodeBtn, LeaveWorkspaceBtn } from "./components/function/btn";
import { TableOfContents } from "./components/mdx/toc";
import '/styles/github-markdown.css'
import { Avatar, AvatarGroup } from "@nextui-org/avatar";

export default withPageAuthRequired(
    // ensuer user logged in
    async function Page({ params: { lang, slug } }) {
        const dict = await getDictionary(lang);

        const { user } = await getSession();
        var data = { created: null, privilege: null, f_id: null, f_name: null, file: null, progress: null, invite_code: null, users: null };

        const connection = await pool.getConnection();

        // get workspace details
        try {
            var [workSpace,] = await connection.execute(
                "SELECT created, privilege, f_id, f_name FROM w_uw_view WHERE id = ? AND u_id = ?;",
                [slug, user.sub]
            );
            if (workSpace.length == 0) {
                // user not in workspace || workspace not found
                return notFound();
            }
            // @assert(workSpace.length == 1)
            workSpace = workSpace[0];
            data.created = workSpace.created;
            data.privilege = workSpace.privilege;
            data.f_id = workSpace.f_id;
            data.f_name = workSpace.f_name;
            try {
                const [[file]] = await pool.execute(
                    "SELECT f_name AS name, f as content FROM u_f_view WHERE f_id = ? AND (is_public = true OR u_id = ?);",
                    [data.f_id, pathUserID]
                );
                data.file = file.content;
            } catch (err) {
                // file not found
                console.error(err);
                return notFound();
            }
        } catch (err) {
            // database connection error
            console.error(err);
            return notFound();
        }

        // get invite code
        try {
            const sql = "SELECT invite_code, code_expire_at FROM workspaces WHERE id = ?;";
            var [inviteCode,] = await connection.execute(sql, [slug]);
            data.invite_code = inviteCode[0].invite_code && inviteCode[0].code_expire_at > new Date() ? inviteCode[0].invite_code : null;
        } catch (err) {
            console.error(err);
            return notFound();
        }

        // get users
        try {
            const sql = "SELECT u_id, privilege FROM w_uw_view WHERE id = ?;";
            var [users,] = await connection.execute(sql, [slug]);
            data.users = users;
        } catch (err) {
            console.error(err);
            return notFound();
        }

        connection.release();

        // encrypt user id and workspace id for socket connection
        const encryptedUserID = encrypt(JSON.stringify(user.sub));
        const encryptedWorkSpaceID = encrypt(JSON.stringify(slug));

        return (
            <main className="flex">
                <div className="hidden md:block min-w-[200px] pt-11">
                    <section>TOC</section>
                    <TableOfContents />
                    <div className=" pt-6">
                        <section>Actions</section>
                        <ShareCodeBtn workspaceID={slug} initCode={data.invite_code} />
                        <LeaveWorkspaceBtn workspaceID={slug} />
                    </div>
                    <div className="pt-6">
                        <section>Participants</section>
                        <AvatarGroup>
                            {data.users.map((user) => (
                                <Avatar key={user.u_id} />
                            ))}
                        </AvatarGroup>
                    </div>
                </div>
                <div className="markdown-body overflow-auto h-[calc(100vh-65px)]">
                    <SocketProvider userID={encryptedUserID} workSpaceID={encryptedWorkSpaceID}>
                        <MDXRemote source={data.file} components={customMDX()} />
                    </SocketProvider>
                </div>
            </main>
        );
    },
    { returnTo: ({ params: { lang, slug } }) => `/workspace/${slug}` }
);
