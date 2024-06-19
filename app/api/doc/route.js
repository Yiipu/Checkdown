import { getApiDocs } from "lib/swagger";

export const GET = async (req) => {
    const spec = await getApiDocs();
    return Response.json(spec);
};