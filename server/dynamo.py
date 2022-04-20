import boto3
import uuid
from decouple import config
from boto3.dynamodb.conditions import Key


AWS_ACCESS_KEY_ID     = config("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
REGION_NAME           = config("REGION_NAME")

client = boto3.client(
    'dynamodb',
    aws_access_key_id     = AWS_ACCESS_KEY_ID,
    aws_secret_access_key = AWS_SECRET_ACCESS_KEY,
    region_name           = REGION_NAME,
)
resource = boto3.resource(
    'dynamodb',
    aws_access_key_id     = AWS_ACCESS_KEY_ID,
    aws_secret_access_key = AWS_SECRET_ACCESS_KEY,
    region_name           = REGION_NAME,
)

clothTable = resource.Table('Clothe_ingrid')

clothTable.put_item(
    Item = {
        'id' : str(uuid.uuid4()),
        'colour' : 'black',
        'category' : 4,
        's3' : 'pasdfdsfo.jpg'
    }
)

# response = clothTable.query(
#     IndexName = 'category-colour-index',
#     KeyConditionExpression = Key('colour').eq('dark_red') & Key('category').eq(1)
# )
