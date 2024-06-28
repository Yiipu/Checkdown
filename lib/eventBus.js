import EventEmitter from 'events';
import { pool } from './pool';
const emitter = new EventEmitter();
export default emitter;

emitter.on("LangTaskCreated", async (fileID, operationLocation) => {
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
                    emitter.emit('LangTaskCreated', fileID, operationLocation);
                }, 10000)
                return;
            }
            return res.json();
        })
        .then(async data => {
            if (data.status == "error") {
                console.error(`Error getting result for file ID: ${fileID}: ${data.message}`);
                return;
            } else if (data.status !== "succeeded") {
                console.log(`Summarization for file ID: ${fileID} is ${data.status}. Retrying...`);
                setTimeout(() => {
                    emitter.emit('LangTaskCreated', fileID, operationLocation);
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
                            emitter.emit('LangTaskCreated', fileID, operationLocation);
                        }, 10000)
                    }
                    const params = [text, fileID];
                    pool.execute(query, params).catch(err => console.error(err));
                } else {
                    console.log(`Status unknown for file ID: ${fileID}. Retrying...`);
                    setTimeout(() => {
                        emitter.emit('LangTaskCreated', fileID, operationLocation);
                    }, 10000)
                }
            })
        })
        .catch(err => {
            console.error(`Error getting result for file ID: ${fileID}: ${err}. Retrying in 10 seconds.`);
            setTimeout(() => {
                emitter.emit('LangTaskCreated', fileID, operationLocation);
            }, 10000)
        });
});

emitter.on('LangTaskRequired', async (fileID) => {
    console.log(`Starting upload for file with ID: ${fileID}`);
    const [rows] = await pool.execute("SELECT file, description FROM mdx_files WHERE id = ?;", [fileID]);
    if (rows.length > 0 && rows[0].description != null) {
        console.log(`File with ID: ${fileID} already has a description. Skipping task.`);
        return;
    }
    const fileBuffer = rows[0].file;
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
                                "text": fileBuffer
                            }
                        ]
                    },
                    "tasks": [
                        {
                            "kind": "AbstractiveSummarization",
                            "taskName": `Summarize ${fileID}`,
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
                console.log(`Retrying upload for file with ID: ${fileID} due to ${res.status} response.`);
                setTimeout(() => {
                    emitter.emit("LangTaskRequired", fileID);
                }, 10000)
                return;
            };
            const operationLocation = res.headers.get("operation-location");
            console.log(`Upload succeeded for file with ID: ${fileID}. Operation location: ${operationLocation}`);
            emitter.emit('LangTaskCreated', fileID, operationLocation);
        })
        .catch(err => {
            console.error(`Error adding language task for file with ID: ${fileID}: ${err}. Retrying in 10 seconds.`);
            setTimeout(() => {
                emitter.emit("LangTaskRequired", fileID);
            }, 10000)
        });
});
