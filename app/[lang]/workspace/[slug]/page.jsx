import { pool } from "lib/database";
import { getDictionary } from "/lib/dictionaries";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { notFound } from 'next/navigation';
import { MDXRemote } from "next-mdx-remote/rsc";
import { customMDX } from "./components/mdx/custommdx";
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
            <main>
                <div>
                    work_space_details
                </div>
                <ul>
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
                <div className="markdown-body">
                    <MDXRemote source={data.file} components={customMDX()} />
                </div>
            </main>
        );
    },
    { returnTo: ({ params: { lang, slug } }) => `/workspace/${slug}` }
);
