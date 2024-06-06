import { getSession } from '@auth0/nextjs-auth0';
import { getFile, listFileWorkSpace, listUserFiles, listUserWorkSpaces } from '/lib/database.ts'
import { getDictionary } from '/lib/dictionaries'
import { WorkSpaceList } from './components/client'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import "/styles/github-markdown.css"

export default async function Page({ params: { lang, slug: [pathUserID, fileName] } }) {
    // localization
    const dict = await getDictionary(lang);

    // TODO: check if pathUserID is valid

    // get user session
    const session = await getSession();
    const { user } = session ? session : { user: null };
    const isOwner = user ? (user.sub.split('|')[1] === pathUserID) : false;

    // if fileName, preview
    if (fileName) {
        // get workspaces the fist time
        var fileWorkSpaces = [{ id: null, created: null, privilege: null }];
        const file = await getFile(fileName, pathUserID);

        if (user) {
            fileWorkSpaces = await listFileWorkSpace(file.f_id, user.sub.split('|')[1]);
            if (fileWorkSpaces.error) {
                fileWorkSpaces = [];
            }
        }

        return (
            <main>
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1">
                        <span>workspaces_on_this_file</span>
                        {user && <WorkSpaceList workspace_init={fileWorkSpaces} fileID={file.f_id} userID={user.sub} />}
                    </div>
                    <div className="col-span-3">
                        <div>preview_only</div>
                        <div className="markdown-body pointer-events-none" >
                            {file.error ?
                                <div>{file.error}</div>
                                : (!file.is_public && !isOwner) ?
                                    <div>not_authorized</div>
                                    : <MDXRemote source={file.f} />
                            }
                        </div>
                    </div>
                </div>
            </main >
        )
    }

    // else, user's profile
    const userFiles = await listUserFiles(pathUserID);
    var userWorkSpaces = [];
    if (isOwner) {
        userWorkSpaces = await listUserWorkSpaces(pathUserID);
    }
    return (
        <div>
            <h1>{pathUserID}</h1>
            <div>
                <span>user_files</span>
                {userFiles.error ?
                    <div>{userFiles.error}</div>
                    :
                    <ul>
                        {userFiles.map((file, _) => (
                            (file.is_public || isOwner) && <li key={_}>
                                <Link href={`/${pathUserID}/${file.f_name}`}>{file.f_name}</Link>
                            </li>
                        ))}
                    </ul>
                }
            </div>
            <div>
                <span>user_workspaces</span>
                {isOwner && <ul>
                    {userWorkSpaces.map((ws, _) => (
                        <li key={_}>
                            <Link href={`/workspace/${ws.id}`}>
                                ws.id: {ws.id} <br />
                                ws.privilege: {ws.privilege} <br />
                            </Link>
                        </li>
                    ))}
                </ul>
                }
            </div>
        </div>
    )
}