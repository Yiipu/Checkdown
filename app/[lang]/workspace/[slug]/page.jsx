import { pool } from "lib/pool";
import { getDictionary } from "/lib/dictionaries";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { notFound } from 'next/navigation';
import { MDXRemote } from "next-mdx-remote/rsc";
import { customMDX } from "./components/mdx/custommdx";
import { SocketProvider } from "./components/socket/socketprovider";
import { encrypt } from "/lib/utils";
import { ShareCodeBtn, LeaveWorkspaceBtn } from "./components/function/btn";
import '/styles/github-markdown.css'

export default withPageAuthRequired(
    // ensuer user logged in
    async function Page({ params: { lang, slug } }) {
        const dict = await getDictionary(lang);

        const { user } = await getSession();
        var data = { created: null, privilege: null, f_id: null, f_name: null, file: null, progress: null, invite_code: null };

        // get workspace details
        try {
            var [workSpace,] = await pool.execute(
                "SELECT created, privilege, f_id, f_name FROM w_uw_view WHERE id = ? AND u_id = ?;",
                [slug, user.sub.split("|")[1]]
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
                const [file,] = await pool.execute(
                    "SELECT file FROM mdx_files WHERE id = ?;",
                    [workSpace.f_id]
                );
                data.file = file[0].file;
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

        // get progress
        try {
            const sql = " SELECT task_id, is_done, updated_by_user, updated_at "
                + " FROM progresses "
                + " WHERE workspace_id = ? "
                + " ORDER BY task_id ASC; "
            var [progress,] = await pool.execute(sql, [slug]);
            data.progress = progress;
        } catch (err) {
            console.error(err);
            return notFound();
        }

        // get invite code
        try {
            const sql = "SELECT invite_code, code_expire_at FROM workspaces WHERE id = ?;";
            var [inviteCode,] = await pool.execute(sql, [slug]);
            data.invite_code = inviteCode[0].invite_code && inviteCode[0].code_expire_at > new Date() ? inviteCode[0].invite_code : null;
        } catch (err) {
            console.error(err);
            return notFound();
        }

        // initialize progress.
        const initProgress = Array();
        data.progress.forEach((task) => {
            initProgress[task.task_id] = task.is_done;
        });

        // encrypt user id and workspace id for socket connection
        const encryptedUserID = encrypt(JSON.stringify(user.sub.split("|")[1]));
        const encryptedWorkSpaceID = encrypt(JSON.stringify(slug));

        return (
            <main className="grid grid-cols-3 px-8">
                <div>
                    <ul className="flex justify-evenly">
                        <li>
                            <ShareCodeBtn workspaceID={slug} initCode={data.invite_code} />
                        </li>
                        <li>
                            <LeaveWorkspaceBtn workspaceID={slug} />
                        </li>
                    </ul>
                    <div className="p-8">
                        work_space_details
                    </div>
                </div>
                <div className="markdown-body col-span-2 overflow-auto h-[calc(100vh-88px)]">
                    <SocketProvider userID={encryptedUserID} workSpaceID={encryptedWorkSpaceID} initProgress={initProgress}>
                        <MDXRemote source={data.file} components={customMDX()} />
                    </SocketProvider>
                </div>
            </main>
        );
    },
    { returnTo: ({ params: { lang, slug } }) => `/workspace/${slug}` }
);
