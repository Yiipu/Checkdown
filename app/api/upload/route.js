import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { insertFile } from "/lib/database";

export const POST = withApiAuthRequired(async function (req) {
  const res = new Response();

  const { user } = await getSession(req, res);
  const userID = user.sub.split("|")[1];

  const formData = await req.formData();
  const file = formData.get("file");
  const fileBuffer = await file.arrayBuffer();
  const isPublic = formData.get("isPublic") == "true";

  const dbRes = await insertFile(fileBuffer, file.name, userID, isPublic);
  const status = dbRes.error ? 500 : 201;

  return new Response(JSON.stringify(dbRes), { status: status }, { res });
});
