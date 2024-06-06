import { pool } from "lib/database";
import { getDictionary } from "/lib/dictionaries";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { notFound } from 'next/navigation';
import { MDXRemote } from "next-mdx-remote/rsc";
import { customMDX } from "./components/mdx/custommdx";
import { SocketProvider } from "./components/socket/socketprovider";
import '/styles/github-markdown.css'

export default withPageAuthRequired(
    async function Page({ params: { lang, slug } }) {
        const dict = await getDictionary(lang);

        const { user } = await getSession();
        var data = { created: null, privilege: null, f_id: null, f_name: null, file: null };

        try {
            var [workSpace,] = await pool.execute(
                "SELECT created, privilege, f_id, f_name FROM w_uw_view WHERE id = ? AND u_id = ?;",
                [slug, user.sub.split("|")[1]]
            );
            if (workSpace.length == 0) {
                return notFound();
            }
            workSpace = workSpace[0];
            try {
                const [file,] = await pool.execute(
                    "SELECT file FROM mdx_files WHERE id = ?;",
                    [workSpace.f_id]
                );
                data.created = workSpace.created;
                data.privilege = workSpace.privilege;
                data.f_id = workSpace.f_id;
                data.f_name = workSpace.f_name;
                data.file = file[0].file;
            } catch (err) {
                console.error(err);
                return notFound();
            }
        } catch (err) {
            console.error(err);
            return notFound();
        }

        return (
            <main className="grid grid-cols-3 px-8">
                <div>
                    <ul className="flex justify-evenly">
                        <li>
                            <button>
                                share_code
                            </button>
                        </li>
                        <li>
                            <button>
                                quit_workspace
                            </button>
                        </li>
                    </ul>
                    <div className="p-8">
                        work_space_details
                    </div>
                </div>
                <div className="markdown-body col-span-2 overflow-auto h-[calc(100vh-88px)]">
                    <SocketProvider room={slug} initProgress={[true, false, false]}>
                        <MDXRemote source={data.file} components={customMDX()}/>
                    </SocketProvider>
                </div>
            </main>
        );
    },
    { returnTo: ({ params: { lang, slug } }) => `/workspace/${slug}` }
);
