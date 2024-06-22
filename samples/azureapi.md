
## request

```bash
curl -i -X POST https://lang-checkdown.cognitiveservices.azure.com/language/analyze-text/jobs?api-version=2023-04-01 \
-H "Content-Type: application/json" \
-H "Ocp-Apim-Subscription-Key: "d5d59eb6329743ceaab4eb790a2840dd"" \
-d \
' 
{
  "displayName": "Text Abstractive Summarization Task Example",
  "analysisInput": {
    "documents": [
      {
        "id": "1",
        "language": "en",
        "text": "At Microsoft, we have been on a quest to advance AI beyond existing techniques, by taking a more holistic, human-centric approach to ..."
      }
    ]
  },
  "tasks": [
    {
      "kind": "AbstractiveSummarization",
      "taskName": "Text Abstractive Summarization Task 1",
      "parameters": {
        "summaryLength": "short"
      }
    }
  ]
}
'
```

## response

```text
HTTP/2 202 
content-length: 0
operation-location: https://lang-checkdown.cognitiveservices.azure.com/language/analyze-text/jobs/f05c66b8-3717-4e82-84c7-b694e5e74439?api-version=2023-04-01
x-envoy-upstream-service-time: 166
apim-request-id: de4623ba-cb2f-43ad-98a6-eba42023353c
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-content-type-options: nosniff
x-ms-region: East US
date: Fri, 21 Jun 2024 11:00:52 GMT
```

## get-result later

```bash
curl -X GET https://lang-checkdown.cognitiveservices.azure.com/language/analyze-text/jobs/f05c66b8-3717-4e82-84c7-b694e5e74439?api-version=2023-04-01 \
-H "Content-Type: application/json" \
-H "Ocp-Apim-Subscription-Key: "d5d59eb6329743ceaab4eb790a2840dd""
```

## result

```json
{
    "jobId": "cd6418fe-db86-4350-aec1-f0d7c91442a6",
    "lastUpdateDateTime": "2022-09-08T16:45:14Z",
    "createdDateTime": "2022-09-08T16:44:53Z",
    "expirationDateTime": "2022-09-09T16:44:53Z",
    "status": "succeeded",
    "errors": [],
    "displayName": "Text Abstractive Summarization Task Example",
    "tasks": {
        "completed": 1,
        "failed": 0,
        "inProgress": 0,
        "total": 1,
        "items": [
            {
                "kind": "AbstractiveSummarizationLROResults",
                "taskName": "Text Abstractive Summarization Task 1",
                "lastUpdateDateTime": "2022-09-08T16:45:14.0717206Z",
                "status": "succeeded",
                "results": {
                    "documents": [
                        {
                            "summaries": [
                                {
                                    "text": "Microsoft is taking a more holistic, human-centric approach to AI. We've developed a joint representation to create more powerful AI that can speak, hear, see, and understand humans better. We've achieved human performance on benchmarks in conversational speech recognition, machine translation, ...... and image captions.",
                                    "contexts": [
                                        {
                                            "offset": 0,
                                            "length": 247
                                        }
                                    ]
                                }
                            ],
                            "id": "1"
                        }
                    ],
                    "errors": [],
                    "modelVersion": "latest"
                }
            }
        ]
    }
}
```