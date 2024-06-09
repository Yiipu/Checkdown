import { getDictionary } from '/lib/dictionaries'
import { FileList } from "./components/userfilelist"
import { WorkSpaceList } from "./components/userworkspacelist"
import "/styles/github-markdown.css"

export default async function Page({ params: { lang, pathUserID } }) {
    // localization
    const dict = await getDictionary(lang);

    return (
        <div className="grid grid-cols-3">
            <div className="col-span-1 p-8">
                <FileList pathUserID={pathUserID} />
            </div>
            <div className="col-span-2 p-8">
                <WorkSpaceList />
            </div>
        </div>
    )
}