import { FileDropZone } from "./components/upload";
import Link from 'next/link';

export default async function HomePage() {
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
                        <FileDropZone/>
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
