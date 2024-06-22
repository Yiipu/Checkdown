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
    const file = await getFile(fileID, user?.sub || null);

    // return 404 when file not found
    if (!file) {
        return <div>File not found</div>
    }

    return (
        <main>
            <div className="flex flex-col-reverse md:flex-row pt-2">
                <div className='md:mr-8'>
                    {user && <WorkSpaceList fileID={fileID} />}
                </div>
                <div className="markdown-body overflow-auto h-[calc(100vh-88px)] shadow-inner hover:shadow-lg" >
                    {file && <MDXRemote source={file.content} />}
                </div>
            </div>
        </main >
    )
}