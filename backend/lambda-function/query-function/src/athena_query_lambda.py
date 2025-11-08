import boto3
import time
import json
import os

ATHENA_DATABASE = os.environ.get("ATHENA_DATABASE", "chronos-logs-db")
ATHENA_OUTPUT = os.environ.get("ATHENA_OUTPUT", "s3://query-results-api/")
ATHENA_WORKGROUP = os.environ.get("ATHENA_WORKGROUP", "primary")

athena = boto3.client("athena", region_name="ap-south-1")

# --- ADD THIS HEADER OBJECT ---
# This tells the browser that your frontend domain is allowed to access this API
CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*', # For production, you'd replace * with your CloudFront URL
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
}

def lambda_handler(event, context):
    
    # Handle the browser's preflight OPTIONS request
    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return {
            'statusCode': 204,
            'headers': CORS_HEADERS,
            'body': ''
        }
    
    if "body" in event:
        try:
            event = json.loads(event["body"])
        except:
            pass
            
    query = event.get("query")
    if not query:
        # --- ADD HEADERS ---
        return {
            "statusCode": 400, 
            "headers": CORS_HEADERS, 
            "body": json.dumps({"error": "Missing SQL query."})
        }

    # 1. Start query
    try:
        resp = athena.start_query_execution(
            QueryString=query,
            QueryExecutionContext={"Database": ATHENA_DATABASE},
            ResultConfiguration={"OutputLocation": ATHENA_OUTPUT},
            WorkGroup=ATHENA_WORKGROUP,
        )
    except Exception as e:
        print(f"Error starting query: {e}")
        return {
            "statusCode": 400, # Often a bad query
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": f"Athena query failed: {str(e)}"})
        }

    qid = resp["QueryExecutionId"]
    print(f"Started Athena QueryExecutionId: {qid}")

    # 2. Poll until finished
    while True:
        try:
            q = athena.get_query_execution(QueryExecutionId=qid)
            state = q["QueryExecution"]["Status"]["State"]
            if state in ["SUCCEEDED", "FAILED", "CANCELLED"]:
                break
            time.sleep(1) # Poll every 1 second
        except Exception as e:
             return {
                "statusCode": 500, 
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": f"Error polling query: {str(e)}"})
            }

    if state != "SUCCEEDED":
        reason = q["QueryExecution"]["Status"].get("StateChangeReason", "")
        # --- ADD HEADERS ---
        return {
            "statusCode": 500, 
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": f"Query {state}: {reason}"})
        }

    # 3. Retrieve result rows
    res = athena.get_query_results(QueryExecutionId=qid)
    rows = []
    headers = [col["VarCharValue"] for col in res["ResultSet"]["Rows"][0]["Data"]]
    for row in res["ResultSet"]["Rows"][1:]:
        row_dict = {
            headers[i]: cell.get("VarCharValue", None)
            for i, cell in enumerate(row["Data"])
        }
        rows.append(row_dict)

    # --- ADD HEADERS ---
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS, # <-- ADDED
        "body": json.dumps(
            {"QueryExecutionId": qid, "ResultCount": len(rows), "Rows": rows},
            indent=2,
        ),
    }