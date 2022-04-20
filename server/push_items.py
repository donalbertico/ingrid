import boto3
import uuid
from decouple import config

categoriesDic = {
    0: 'shirt, blouse',
    1: 'top, t-shirt, sweatshirt',
    2: 'sweater',
    3: 'cardigan',
    4: 'jacket',
    5: 'vest',
    6: 'pants',
    7: 'shorts',
    8: 'skirt',
    9: 'coat',
    10: 'dress',
    11: 'jumpsuit',
    12: 'cape',
    13: 'tights, stockings',
    14: 'hood',
    15: 'lapel',
    16: 'accesories',
    101: 'lace-up',
    102: 'boots',
    103: 'belt',
    104: 'wallet',
    105: 'backpack',
    106: 'bag',
    107: 'slip-on',
    108: 'sneaker',
    109: 'pumps',
    110: 'sandals',
    111: 'suit',
    112: 'socks',
    113: 'slg',
    114: 'handbag',
    115: 'shoes',
    116: 'jewelry',
    117: 'flats',
    118: 'keyring'
}

categoriesDic = dict([(value, key) for key, value in categoriesDic.items()])

AWS_ACCESS_KEY_ID     = config("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
REGION_NAME           = config("REGION_NAME")

resource = boto3.resource(
    'dynamodb',
    aws_access_key_id     = AWS_ACCESS_KEY_ID,
    aws_secret_access_key = AWS_SECRET_ACCESS_KEY,
    region_name           = REGION_NAME,
)

clothTable = resource.Table('Clothe')

with open('clothe_props.txt') as f:
    for line in f:
        line = line.replace('\n','')
        line = line.split('\t')
        cat = line[1].lower()
        gender = line[3]
        if categoriesDic.get(cat) is not None :
            cat = categoriesDic[cat]
        else :
            for key, value in categoriesDic.items():
                category = key.split(', ')
                if cat in category:
                    cat = value

        if gender.lower() == 'women' or  gender.lower() == 'woman':
            gender = 0
        else :
            gender = 1

        if type(cat) == int :
            clothTable.put_item(
                Item = {
                    'id' : str(uuid.uuid4()),
                    'category' : cat,
                    'colour' : line[2].lower(),
                    's3' : line[0],
                    'gender' : gender
                }
            )
