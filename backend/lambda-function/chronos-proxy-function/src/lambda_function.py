import json
import requests
import boto3
import os
import time
import uuid
import base64

# Initialize clients ONCE for reuse
firehose_client = boto3.client('firehose')
FIREHOSE_STREAM_NAME = os.environ.get('FIREHOSE_STREAM_NAME') 
TARGET_BASE_URL = os.environ.get('TARGET_BASE_URL') 

def lambda_handler(event, context):
    
    print(f"Received event: {json.dumps(event)}")
    
    http_method = event['requestContext']['http']['method']
    path = event['rawPath']
    query_params = event.get('queryStringParameters', {})
    headers = event['headers'] # Get the original request headers
    
    body = event.get('body')
    if body and event.get('isBase64Encoded', False):
        body = base64.b64decode(body)

    if not TARGET_BASE_URL:
        return {"statusCode": 500, "body": json.dumps("FATAL ERROR: TARGET_BASE_URL is not set")}

    target_url = f"{TARGET_BASE_URL}{path}"
    
    print(f"Forwarding request to: {http_method} {target_url}")
    
    try:
        response = requests.request(
            method=http_method,
            url=target_url,
            params=query_params,
            headers={k: v for k, v in headers.items() if k.lower() not in ['host', 'x-amzn-trace-id']},
            data=body,
            timeout=5
        )

        print(f"Received response: {response.status_code}")
        response_text = response.text
        
        processed_headers = dict(response.headers)
        processed_headers.pop('Content-Encoding', None)
        processed_headers.pop('Transfer-Encoding', None)
        processed_headers.pop('Content-Length', None)

        proxy_response = {
            'statusCode': response.status_code,
            'headers': processed_headers,
            'body': response_text,
            'isBase64Encoded': False
        }
        
        # Prepare response details for logging
        response_status_code_str = str(response.status_code) # <-- FIX: Convert to string
        response_headers_str = json.dumps(processed_headers) # Convert headers to a string
        response_body_str = response_text

    except requests.exceptions.RequestException as e:
        print(f"Error forwarding request: {e}")
        error_body = json.dumps({"error": "Bad Gateway", "details": str(e)})
        proxy_response = {"statusCode": 502, "body": error_body, "isBase64Encoded": False}
        
        response_status_code_str = "502" # <-- FIX: Convert to string
        response_headers_str = "{}" # Empty headers string on error
        response_body_str = str(e)

    
    # 3. Create records for Kinesis (STABLE, UNIFIED SCHEMA)
    record_id = context.aws_request_id
    request_timestamp = int(time.time())

    # --- THIS IS THE FIX ---
    # Both records MUST have the exact same keys.
    # All data types MUST be consistent (e.g., string or null).

    request_record = {
        "record_id": record_id,
        "type": "request",
        "timestamp": request_timestamp,
        "method": http_method,
        "path": path,
        "queries": json.dumps(query_params), 
        "headers": json.dumps(headers),     # This is a string
        "body": body if isinstance(body, str) else "Binary data",
        
        # --- Response fields must be present as null ---
        "statusCode": None,     
        "response_headers": None, # Renamed this field
        "response_body": None 
    }
    
    response_record = {
        "record_id": record_id,
        "type": "response",
        "timestamp": int(time.time()),
        
        # --- Request fields must be present as null ---
        "method": None,         
        "path": None,           
        "queries": None,        
        "headers": None,        
        "body": None,           

        # --- Response fields are filled ---
        "statusCode": response_status_code_str, # This is now a string
        "response_headers": response_headers_str, # This is also a string
        "response_body": response_body_str
    }
    # --- END OF FIX ---

    # 4. Send records to Kinesis
    if FIREHOSE_STREAM_NAME:
        try:
            firehose_client.put_record_batch(
                DeliveryStreamName=FIREHOSE_STREAM_NAME,
                Records=[
                    {'Data': json.dumps(request_record) + '\n'}, 
                    {'Data': json.dumps(response_record) + '\n'}
                ]
            )
            print("Successfully sent records to Firehose.")
        except Exception as e:
            print(f"Failed to send record to Firehose: {e}")
    else:
        print("FIREHOSE_STREAM_NAME not set. Skipping log to Kinesis.")

    # 5. Return the response to the user
    return proxy_response