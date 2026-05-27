import os
import boto3
import urllib.request

def handler(event, context):
    """Скачивает текстуры hero с postimg.cc и загружает в S3"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}, 'body': ''}

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

    assets = [
        {
            'url': 'https://i.postimg.cc/XYwvXN8D/img-4.png',
            'key': 'hero/texture.png',
            'content_type': 'image/png'
        },
        {
            'url': 'https://i.postimg.cc/2SHKQh2q/raw-4.webp',
            'key': 'hero/depthmap.webp',
            'content_type': 'image/webp'
        }
    ]

    results = {}
    access_key = os.environ['AWS_ACCESS_KEY_ID']

    for asset in assets:
        req = urllib.request.Request(asset['url'], headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        s3.put_object(
            Bucket='files',
            Key=asset['key'],
            Body=data,
            ContentType=asset['content_type']
        )
        cdn_url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{asset['key']}"
        results[asset['key']] = cdn_url

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': str(results)
    }
