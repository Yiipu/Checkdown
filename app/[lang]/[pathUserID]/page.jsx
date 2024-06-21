import { ProfileTab } from "./components/tabs";

async function getUser(pathUserID) {
    const res = await fetch(`${process.env.AUTH0_BASE_URL}/api/users/${pathUserID}`);
    const data = await res.json();
    return data;
}

export default async function Page({ params: { lang, pathUserID }, searchParams: { tab } }) {
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
            <ProfileTab selectedKey={tab} pathUserID={decodedPathUserID} pathUser={pathUser} />
        </div>
    )
}
