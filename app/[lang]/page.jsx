import { FileDropZone } from "./components/upload";
import { getSession } from '@auth0/nextjs-auth0';
import Link from 'next/link';

export default async function HomePage() {
    const session = await getSession();
    const user = session ? session.user : null;

    return (
        <main>
            <div className="flex justify-around">
                <div className="self-center">
                    <input type="text" placeholder="search_for_files" className="min-w-28 text-black" />
                    <button>Q</button>
                </div>
            </div>
            <div className="grid grid-cols-2 p-8">
                <div>
                    <div className="h-80">
                        {user && <FileDropZone userID={user.sub.split('|')[1]} />}
                    </div>
                </div>
                <div>
                    <Link href="/market" className="h-80 flex justify-center items-center">
                        <div >browse_files</div>
                    </Link>
                </div>
            </div>
        </main>
    );
}
