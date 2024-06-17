import { getSession } from '@auth0/nextjs-auth0';
import { getDictionary } from '/lib/dictionaries'
import { WorkSpaceList } from './components/workspacelist'
import { MDXRemote } from 'next-mdx-remote/rsc'
import "/styles/github-markdown.css"
import { getFile } from 'lib/utils';

export default async function Page({ params: { lang, pathUserID, fileName }, searchParams }) {
    // localization
    const dict = await getDictionary(lang);

    const fileID = searchParams['file_id'];

    // get user session
    const session = await getSession();
    const { user } = session ? session : { user: null };
    const isOwner = user ? (user.sub === pathUserID) : false;

    // get file
    const file = await getFile(fileID, user?.sub.split('|')[1] || null);

    // TODO: return 404 when file not found

    return (
        <main>
            <div className="grid grid-cols-3 px-8">
                <div className="col-span-1">
                    <span>workspaces_on_this_file</span>
                    {user && <WorkSpaceList fileID={fileID} />}
                </div>
                <div className="col-span-2">
                    <div className="markdown-body overflow-auto h-[calc(100vh-88px)]" >
                        {file && <MDXRemote source={file.content} />}
                    </div>
                </div>
            </div>
        </main >
    )
}