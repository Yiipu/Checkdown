import { getDictionary } from '/lib/dictionaries'
import { FileList } from "./components/userfilelist"
import { WorkSpaceList } from "./components/userworkspacelist"
import "/styles/github-markdown.css"

async function validatePathUserID(pathUserID) {
    const res = await fetch(`${process.env.AUTH0_BASE_URL}/api/users/${pathUserID}`);
    const data = await res.json();
    return data;
}

export default async function Page({ params: { lang, pathUserID } }) {
    // validate pathUserID
    const user = await validatePathUserID(pathUserID);
    if (!user) {
        return <div>Invalid pathUserID</div>
    }

    // localization
    const dict = await getDictionary(lang);
    const decodedPathUserID = decodeURIComponent(pathUserID);

    return (
        <div className="grid grid-cols-3">
            <div className="col-span-1 p-8">
                <FileList pathUserID={decodedPathUserID} />
            </div>
            <div className="col-span-2 p-8">
                <WorkSpaceList />
            </div>
        </div>
    )
}