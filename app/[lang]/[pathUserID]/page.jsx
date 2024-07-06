import { ProfileTab } from "./components/tabs";
import { getDictionary } from "lib/dictionaries";

async function getUser(pathUserID) {
    const res = await fetch(`${process.env.AUTH0_BASE_URL}/api/users/${pathUserID}`);
    if (!res.ok) {
        return null;
    }
    const data = await res.json();
    return data;
}

export default async function Page({ params: { lang, pathUserID }, searchParams: { tab } }) {
    const dictionary = await getDictionary(lang);
    const pathUser = await getUser(pathUserID);
    if (!pathUser) {
        return (
            <div>
                <h1>User not found</h1>
            </div>
        );
    }

    const decodedPathUserID = decodeURIComponent(pathUserID);

    return (
        <div className="pt-2">
            <ProfileTab selectedKey={tab} pathUserID={decodedPathUserID} pathUser={pathUser} dictionary={dictionary} />
        </div>
    )
}
