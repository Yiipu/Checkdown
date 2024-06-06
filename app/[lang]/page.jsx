import { FileDropZone } from "./components/upload";
import { getSession } from '@auth0/nextjs-auth0';

export default async function HomePage() {
    const session = await getSession();
    const user = session ? session.user : null;

    return (
        <main className="grid grid-rows-2 grid-cols-2 gap-4">
            <div className="col-span-2">
                <input type="text" placeholder="search_for_files"/>
            </div>
            <div>
                {user && <FileDropZone userID={user.sub.split('|')[1]} />}
            </div>
            <div>
                browse_files
            </div>
        </main>
    );
}
