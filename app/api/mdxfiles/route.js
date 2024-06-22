import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { insertFile } from "lib/database";
import { pool } from 'lib/pool'

import { EventEmitter } from "events";
import { setTimeout } from "timers";
const emitter = new EventEmitter();

emitter.on("fileSummarized", async (fileID, operationLocation) => {
    console.log(`Starting to summarize file with ID: ${fileID}`);
    fetch(operationLocation,
        {
            method: 'GET',
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.AZURE_LANGUAGE_KEY
            }
        })
        .then(res => {
            if (!res.ok) {
                console.log(`Retrying summarization for file ID: ${fileID} due to non-ok response.`);
                setTimeout(() => {
                    emitter.emit('fileSummarized', fileID, operationLocation);
                }, 10000)
                return;
            }
            return res.json();
        })
        .then(async data => {
            if (data.status == "error"){
                console.error(`Error getting result for file ID: ${fileID}: ${data.message}`);
                pool.execute("UPDATE mdx_files SET description = ? WHERE id = ?;", ["Summarization failed. Retry by re-upload.",file]).catch(err => console.error(err));
                return;
            } else if (data.status !== "succeeded") {
                console.log(`Summarization for file ID: ${fileID} is ${data.status}. Retrying...`);
                setTimeout(() => {
                    emitter.emit('fileSummarized', fileID, operationLocation);
                }, 10000)
                return;
            }
            // actually only one item in the task array. 
            // API document https://learn.microsoft.com/rest/api/language/analyze-text-job-status/analyze-text-job-status?view=rest-language-2023-04-01&tabs=HTTP#abstractivesummarizationlroresult
            data.tasks.items.map(async (item) => {
                if (item.status == "failed") {
                    console.error(`Summarization failed for file ID: ${fileID}`, item.results.errors);
                } else if (item.status == "succeeded") {
                    console.log(`Summarization succeeded for file ID: ${fileID}. Updating database.`);
                    const query = "UPDATE mdx_files SET description = ? WHERE id = ?;";
                    var text = item.results.documents[0].summaries[0].text;
                    if (text.length > 1024) {
                        text = text.substring(0, 1024);
                    } else if (text.length == 0) {
                        text = "No summary available";
                        console.log(`No summary available for file ID: ${fileID}. Retrying...`);
                        setTimeout(() => {
                            emitter.emit('fileSummarized', fileID, operationLocation);
                        }, 10000)
                    }
                    const params = [text, fileID];
                    pool.execute(query, params).catch(err => console.error(err));
                } else {
                    console.log(`Status unknown for file ID: ${fileID}. Retrying...`);
                    setTimeout(() => {
                        emitter.emit('fileSummarized', fileID, operationLocation);
                    }, 10000)
                }
            })
        })
        .catch(err => {
            console.error(`Error getting result for file ID: ${fileID}: ${err}. Retrying in 10 seconds.`);
            setTimeout(() => {
                emitter.emit('fileSummarized', fileID, operationLocation);
            }, 10000)
        });
});

emitter.on('fileUploaded', async (fileBuffer, fileID, fileName) => {
    console.log(`Starting upload for file: ${fileName} with ID: ${fileID}`);
    fetch(process.env.AZURE_LANGUAGE_ENDPOINT + "/language/analyze-text/jobs?api-version=2023-04-01",
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': process.env.AZURE_LANGUAGE_KEY
            },
            body: JSON.stringify(
                {
                    "displayName": "Text Abstractive Summarization Task Example",
                    "analysisInput": {
                        "documents": [
                            {
                                "id": "1",
                                "language": "en",
                                "text": Buffer.from(fileBuffer).toString()
                            }
                        ]
                    },
                    "tasks": [
                        {
                            "kind": "AbstractiveSummarization",
                            "taskName": `Summarize ${fileName}`,
                            "parameters": {
                                "summaryLength": "short"
                            }
                        }
                    ]
                }
            )
        })
        .then(res => {
            if (!res.ok) {
                console.log(`Retrying upload for file: ${fileName} with ID: ${fileID} due to non-ok response.`);
                setTimeout(() => {
                    emitter.emit("fileUploaded", fileBuffer, fileID, fileName);
                }, 10000)
                return;
            };
            const operationLocation = res.headers.get("operation-location");
            console.log(`Upload succeeded for file: ${fileName} with ID: ${fileID}. Operation location: ${operationLocation}`);
            emitter.emit('fileSummarized', fileID, operationLocation);
        })
        .catch(err => {
            console.error(`Error adding language task for file: ${fileName} with ID: ${fileID}: ${err}. Retrying in 10 seconds.`);
            setTimeout(() => {
                emitter.emit("fileUploaded", fileBuffer, fileID, fileName);
            }, 10000)
        });
});

/**
 * @swagger
 * /api/mdxfiles:
 *   post:
 *     description: Upload a file
 *     parameters:
 *       - name: is_public
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether the file is public or not
 *     requestBody:
 *       description: The file to upload.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                type: string
 *                format: binary
 *     responses:
 *       201:
 *         description: File created successfully
 *       400:
 *         description: Bad request. File is too large or file type not accepted
 *       409:
 *         description: Conflict. File with the same name and user already exists
 *       500:
 *         description: Server error
 */
export const POST = withApiAuthRequired(async function (req) {
    const res = new Response();

    const { user } = await getSession(req, res);
    const userID = user.sub;

    const searchParams = req.nextUrl.searchParams;
    const isPublic = searchParams.get('is_public') == "true" || 1;

    const formData = await req.formData();
    const file = formData.get("file");
    const fileBuffer = await file.arrayBuffer();

    const dbRes = await insertFile(fileBuffer, file.name, userID, isPublic);
    const status = dbRes.error ? dbRes.status : 201;

    if (status == 201) {
        setTimeout(() => {
            emitter.emit('fileUploaded', fileBuffer, dbRes.fileID, file.name);
        }, Math.floor(Math.random() * 10000)); // random time span to avoid 429 error from Azure
    }

    return new Response(JSON.stringify(dbRes), { status: status }, { res });
});

/**
 * @swagger
 * /api/mdxfiles:
 *   get:
 *     description: Get a list of files
 *     parameters:
 *       - name: offset
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: The offset of the first item to return
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *         description: The numbers of items to return
 *       - name: user_id
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: sub
 *         description: The user ID
 *       - name: file_name
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: The file name to fuzzy search for
 *       - name: is_public
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: filter by public files, when not specified, return all files if user is owner
 *                      else return only public files
 *     responses:
 *       200:
 *         description: A list of files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       id:
 *                         type: string
 *                       public:
 *                         type: boolean
 *       404:
 *         description: No files found
 *       500:
 *         description: Server error
 */
export const GET = (async function (req) {
    const session = await getSession(req);
    const userID = session?.user.sub || null;

    const res = new Response();

    const searchParams = req.nextUrl.searchParams;
    const offset = searchParams.get('offset');
    const limit = searchParams.get('limit');
    const pathUserID = searchParams.get('user_id');
    const fileName = searchParams.get('file_name');

    const isOwner = userID == pathUserID;

    /* filter by is_public
    * if is_public is not specified, 
    * then return all files if user is owner,
    * else return only public files
    */
    const isPublic = searchParams.get('is_public') == null ?
        (isOwner ? null : true) : searchParams.get('is_public') == "true" || 1;

    if (!isOwner && isPublic === false) {
        return new Response(null, { status: 403 }, res);
    }

    try {
        let query = "SELECT u_id AS user_id, f_name AS name, f_id AS id , is_public AS public, description FROM u_f_view ";
        let params = [];

        if (isPublic !== null) {
            query += "WHERE is_public = ? ";
            params.push(isPublic);
        }
        if (pathUserID !== null) {
            query += (params.length ? "AND " : "WHERE ") + "u_id = ? ";
            params.push(pathUserID);
        }
        if (fileName !== null) {
            query += (params.length ? "AND " : "WHERE ") + "MATCH(f_name) AGAINST(?)"
            params.push(fileName);
        }

        query += "LIMIT ?, ?;";
        params.push(offset || "0", limit || "100");

        const [fileList,] = await pool.execute(query, params);
        const status = fileList.length == 0 ? 404 : 200;
        return Response.json({ data: fileList }, { status: status }, { res });
    } catch (err) {
        console.error(err);
        return new Response(null, { status: 500 }, { res });
    }
});
