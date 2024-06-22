一次完整的预测过程有以下几步：提交任务，获取任务的url，从url获取结果（此时任务可能尚未完成或失败）
完整的api文档参考 [Azure Language Service](https://learn.microsoft.com/en-us/azure/ai-services/language-service/summarization/quickstart?tabs=document-summarization%2Cwindows&pivots=rest-api)

> 可能是我的问题，但即使提供了正确的终结点和密钥，也可能得到未授权回应

## 提交任务

```bash
curl -i -X POST <api-endpoint>jobs?api-version=2023-04-01 \
-H "Content-Type: application/json" \
-H "Ocp-Apim-Subscription-Key: <api-key>" \
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

## 从回应里获取任务url

```text
HTTP/2 202 
content-length: 0
operation-location: <will-be-a-url>
x-envoy-upstream-service-time: 166
apim-request-id: de4623ba-cb2f-43ad-98a6-eba42023353c
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-content-type-options: nosniff
x-ms-region: East US
date: Fri, 21 Jun 2024 11:00:52 GMT
```

## 查询任务状态

```bash
curl -X GET https://lang-checkdown.cognitiveservices.azure.com/language/analyze-text/jobs/f05c66b8-3717-4e82-84c7-b694e5e74439?api-version=2023-04-01 \
-H "Content-Type: application/json" \
-H "Ocp-Apim-Subscription-Key: "d5d59eb6329743ceaab4eb790a2840dd""
```

## 任务成功时的回应

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