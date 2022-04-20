import io
import os
import torch
import webcolors
import json
import boto3
import uuid
import random
import numpy as np
import pandas as pd
from io import BytesIO
from PIL import Image
from PIL import ImageOps
from zipfile import ZipFile
from flask_cors import CORS
from decouple import config
from boto3.dynamodb.conditions import Key
from flask import Flask, render_template, request, make_response, jsonify, send_file


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content_Type'

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
    103: 'belts',
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
    116: 'jewelry'
}

highTops = [4,9,3,2,5,11,12]
lowTops = [0,1,14,10]
bottoms = [6,7,8,13]
shoesPieces = [107,108,109,110,112,115]
accesories = [113,114,116]
colorsNum = 3
colorsDic = json.load(open('colors.json','r'))
colorsCombo = pd.read_csv('colorcombo.csv')

@app.route('/detect',methods=['POST'])
def detect():
    annots = []
    top = True
    bottom = True
    if 'file' not in request.files:
        return 'Missing file',400
    file = request.files['file']
    if file.filename == '':
        return 'No file',400

    img_bytes = file.read()
    img = Image.open(io.BytesIO(img_bytes))
    img = ImageOps.exif_transpose(img)
    result = model(img, size=640)

    for annot in result.xyxy[0] :
        annots.append([int(annot[0]),int(annot[1]),int(annot[2]),int(annot[3]),float(annot[4]),int(annot[5])])
        # if top :
        #     if anotClass in highTops :
        #         annots.append([int(tens[0]),int(tens[1]),int(tens[2]),int(tens[3]),float(tens[4]),anotClass])
        #         top = False
        #     elif anotClass in lowTops :
        #         annots.append([int(tens[0]),int(tens[1]),int(tens[2]),int(tens[3]),float(tens[4]),anotClass])
        #         top = False
        # if bottom :
        #     if anotClass in bottoms :
        #         annots.append([int(tens[0]),int(tens[1]),int(tens[2]),int(tens[3]),float(tens[4]),anotClass])
        #         bottom : False

    splices = []
    stream = BytesIO()
    format = img.format

    with ZipFile(stream, 'w') as zf:
        for i in range(len(annots)):
            x0, y0, x1, y1, conf, cl = annots[i]
            cropped = img.copy()
            width, height = cropped.size
            cropped = cropped.crop((int(_cropLimit0(x0)),int(_cropLimit0(y0)),int(_cropLimit1(x1,width)),int(_cropLimit1(y1, height))))
            # cropped = cropped.crop((x0,y0,x1,y1))
            imgStream = BytesIO()
            cropped = cropped.convert('RGB')
            cropped.save(imgStream,'JPEG')
            cropped.close()
            splices.append(cropped)
            zf.writestr('%s_%s-%s.%s'%(str(cl),categoriesDic[cl],str(random.randint(10,100)),'jpg'),imgStream.getvalue())
    stream.seek(0)

    return send_file(stream, download_name = 'results.zip', as_attachment=True)

def _cropLimit0(point):
    if point - 70 >= 0 :
        return point -70
    elif point-50 >= 0 :
        return point -50
    if point - 25 >= 0 :
        return point -25
    elif point-15 >= 0 :
        return point -15
    else :
        return point
def _cropLimit1(point, size):
    if point +  70 <= size :
        return point + 70
    elif point+ 50 <= size :
        return point + 50
    if point + 25 <= size :
        return point +25
    elif point + 15 <= size :
        return point +15
    else :
        return point

@app.route('/similar',methods=['POST'])
def getSimilar():
    if 'file' not in request.files:
        return 'Missing file',400
    file = request.files['file']
    if file.filename == '':
        return 'No file',400
    if 'gender' in request.form :
        gender = request.form['gender']
    else :
        gender = 2
    img_bytes = file.read()
    img = Image.open(io.BytesIO(img_bytes))
    width, height = img.size
    img = img.crop((width/4,height/4,width - width/4,height - height/4))
    paletted = img.convert('P', palette=Image.ADAPTIVE, colors=colorsNum)
    palette = paletted.getpalette()
    color_counts = sorted(paletted.getcolors(), reverse=True)
    uncat_colors = list()
    colors = list()
    category = file.filename.split('_')[0]
    response = []

    for i in range(colorsNum):
        palette_index = color_counts[i][1]
        dominant_color = palette[palette_index*3:palette_index*3+3]
        webcolor, closest = get_colour_name(tuple(dominant_color))
        colors.append(colorsDic[closest if webcolor is None else webcolor])
        uncat_colors.append(closest if webcolor is None else webcolor)

    query = clothTable.query(
        IndexName = 'category-colour-index',
        KeyConditionExpression = Key('colour').eq(colors[0]) & Key('category').eq(int(category))
    )
    query2 = clothTable.query(
        IndexName = 'category-colour-index',
        KeyConditionExpression = Key('colour').eq(colors[1]) & Key('category').eq(int(category))
    )
    query3 = clothTable.query(
        IndexName = 'category-colour-index',
        KeyConditionExpression = Key('colour').eq(colors[2]) & Key('category').eq(int(category))
    )

    if query['Count'] > 0 :
        if int(gender) == 2 :
            response = random.sample(query['Items'],7)
        else :
            filtered = [ item for item in query['Items'] if 'gender' in item and item['gender'] == int(gender)]
            if len(filtered) > 7:
                response = random.sample(filtered,7)
            else :
                response = filtered

    if query2['Count'] > 0 :
        if int(gender) == 2 :
            response += random.sample(query2['Items'],7)
        else :
            filtered = [ item for item in query2['Items'] if 'gender' in item and item['gender'] == int(gender)]
            if len(filtered) > 7:
                response += random.sample(filtered,7)
            else :
                response += filtered

    if query3['Count'] > 0 :
        if int(gender) == 2 :
            response += random.sample(query3['Items'],7)
        else :
            filtered = [ item for item in query3['Items'] if 'gender' in item and item['gender'] == int(gender)]
            if len(filtered) > 7:
                response += random.sample(filtered,7)
            else :
                response += filtered

    result = []
    [result.append(x) for x in response if x not in result]
    resJson = { 'similar' : result, 'uncat_colors' : uncat_colors, 'colors' : colors}
    return jsonify(resJson)

def closest_colour(requested_colour):
    min_colours = {}
    for key, name in webcolors.CSS3_HEX_TO_NAMES.items():
        r_c, g_c, b_c = webcolors.hex_to_rgb(key)
        rd = (r_c - requested_colour[0]) ** 2
        gd = (g_c - requested_colour[1]) ** 2
        bd = (b_c - requested_colour[2]) ** 2
        min_colours[(rd + gd + bd)] = name
    return min_colours[min(min_colours.keys())]

def get_colour_name(requested_colour):
    try:
        closest_name = actual_name = webcolors.rgb_to_name(requested_colour)
    except ValueError:
        closest_name = closest_colour(requested_colour)
        actual_name = None
    return actual_name, closest_name


@app.route('/combos',methods=['GET'])
def getCombos():
    colors = colorsCombo.columns.array.to_numpy()
    mainColour = request.args.get('colour')
    gender = request.args.get('gender')
    gender = gender if gender else '2'
    gender = int(gender)
    mainIndex = np.where(colors == mainColour)[0]
    mainIndex = int(mainIndex[0])
    category = int(request.args.get('category'))
    colourCombo = []
    combos = {}

    i=0
    while i < 13:
        color = random.randint(0, len(colors)-1)
        if colors[color] not in colourCombo and color != mainIndex :
            if type(colorsCombo.at[color, colors[mainIndex]]) is str:
                colourCombo.append(colors[color])
                i += 1

    for comb in range(5):
        combos[comb], secondColour = getCombo(mainColour,category, colourCombo, gender)
        if secondColour is not mainColour :
            del colourCombo[colourCombo.index(secondColour)]

    return jsonify(combos)

def getCombo(mainColour, category, colourCombo, gender):
    commonTops = [4,9,3]
    avBottoms = bottoms.copy()
    pieceCombo = [0, 0, 0, 0]
    pieceComboDesc = {}
    secondColour = None
    random.shuffle(colourCombo)

    if category in highTops :
        pieceCombo[0] = 1
        pieceComboDesc['main'] = [categoriesDic[category],mainColour]
        piece = getSecondColour(avBottoms,colourCombo,gender)
        if piece :
            pieceCombo[2] = 1
            secondColour = piece['colour']
            pieceComboDesc['bottom'] = piece
        else :
            secondColour = mainColour

        lowerTops = lowTops.copy()
        lowerTopColour = None
        while pieceCombo[1] == 0 and len(lowerTops) > 0:
            lowTopCat = random.choice(lowerTops)
            del lowerTops[lowerTops.index(lowTopCat)]

            if random.randint(0,1) == 0:
                lowTop = getPiece(secondColour, lowTopCat, gender)
            else :
                lowTop = getPiece(mainColour, lowTopCat, gender)

            if lowTop :
                pieceCombo[1] = 1
                pieceComboDesc['lowTop'] = lowTop
                lowerTopColour = lowTop['colour']


        if 'bottom' in pieceComboDesc and'lowTop' in pieceComboDesc and pieceComboDesc['lowTop']['category'] == 10:
            del pieceComboDesc['bottom']

        shoesTypes = shoesPieces.copy()
        while pieceCombo[3] == 0 and len(shoesTypes) > 0:
            shoesCat = random.choice(shoesTypes)
            del shoesTypes[shoesTypes.index(shoesCat)]

            if random.randint(0,1) == 0:
                shoes = getPiece(secondColour, shoesCat, gender)
            else :
                shoes = getPiece(mainColour, shoesCat, gender)

            if shoes :
                pieceCombo[3] = 1
                pieceComboDesc['shoes'] = shoes

    if category in lowTops :
        pieceCombo[1] = 1
        pieceComboDesc['main'] = [categoriesDic[category],mainColour]
        piece = getSecondColour(commonTops,colourCombo,gender)
        if piece :
            pieceCombo[0] = 1
            secondColour = piece['colour']
            pieceComboDesc['top'] = piece
        else :
            secondColour = mainColour

        if category != 10 :
            bottomColour = None
            while pieceCombo[2] == 0 and len(avBottoms) > 0:
                bottomCat = random.choice(avBottoms)
                del avBottoms[avBottoms.index(bottomCat)]

                if random.randint(0,1) == 0:
                    bottom = getPiece(secondColour, bottomCat, gender)
                else :
                    bottom = getPiece(mainColour, bottomCat, gender)

                if bottom :
                    pieceCombo[2] = 1
                    pieceComboDesc['bottom'] = bottom
                    bottomColour = bottom['colour']

        shoesTypes = shoesPieces.copy()
        while pieceCombo[3] == 0 and len(shoesTypes) > 0:
            shoesCat = random.choice(shoesTypes)
            del shoesTypes[shoesTypes.index(shoesCat)]

            if random.randint(0,1) == 0:
                shoes = getPiece(secondColour, shoesCat, gender)
            else :
                shoes = getPiece(mainColour, shoesCat, gender)

            if shoes :
                pieceCombo[3] = 1
                pieceComboDesc['shoes'] = shoes

    if category in bottoms :
        pieceCombo[2] = 1
        pieceComboDesc['main'] = [categoriesDic[category],mainColour]
        piece = getSecondColour(commonTops,colourCombo,gender)
        if piece :
            pieceCombo[0] = 1
            secondColour = piece['colour']
            pieceComboDesc['top'] = piece
        else :
            secondColour = mainColour

        lowerTops = lowTops.copy()
        del lowerTops[lowerTops.index(10)]
        lowerTopColour = None
        while pieceCombo[1] == 0 and len(lowerTops) > 0:
            lowTopCat = random.choice(lowerTops)
            del lowerTops[lowerTops.index(lowTopCat)]

            if random.randint(0,1) == 0:
                lowTop = getPiece(secondColour, lowTopCat, gender)
            else :
                lowTop = getPiece(mainColour, lowTopCat, gender)

            if lowTop :
                pieceCombo[1] = 1
                pieceComboDesc['lowTop'] = lowTop
                lowerTopColour = lowTop['colour']

        shoesTypes = shoesPieces.copy()
        while pieceCombo[3] == 0 and len(shoesTypes) > 0:
            shoesCat = random.choice(shoesTypes)
            del shoesTypes[shoesTypes.index(shoesCat)]

            if random.randint(0,1) == 0:
                shoes = getPiece(secondColour, shoesCat, gender)
            else :
                shoes = getPiece(mainColour, shoesCat, gender)

            if shoes :
                pieceCombo[3] = 1
                pieceComboDesc['shoes'] = shoes


    if random.randint(0,1) == 0:
        accesory = getPiece(secondColour, random.choice(accesories), gender)
    else :
        accesory = getPiece(mainColour, random.choice(accesories), gender)
    if accesory :
        pieceComboDesc['accesory'] = accesory


    return pieceComboDesc, secondColour

def getSecondColour(types,colourCombo,gender):
    colorFound = False
    while colorFound == False and len(types) > 0 :
        complement = random.choice(types)
        del types[types.index(complement)]
        i = 0
        while colorFound == False and i < len(colourCombo) :
            piece = getPiece(colourCombo[i],complement,gender)
            if piece :
                colorFound = True
            i += 1

    if colorFound :
        return piece
    else :
        return False

def getPiece(colour, category, gender):
    query = clothTable.query(
        IndexName = 'category-colour-index',
        KeyConditionExpression = Key('colour').eq(colour) & Key('category').eq(category)
    )
    if query['Count'] > 0 :
        if gender == 2:
            piece = random.choice(query['Items'])
            return piece
        elif gender == 0 :
            filtered = [ item for item in query['Items'] if 'gender' in item and int(item['gender']) == 0]
        elif gender == 1 :
            filtered = [ item for item in query['Items'] if 'gender' in item and int(item['gender']) == 1]
        if not filtered :
            return False
        else :
            piece = random.choice(filtered)
            return piece
    else :
        return False

@app.route('/sonka',methods=['GET','POST'])
def sonka():
    print('we are here')
    if request.args.get('MachineId'):
        print ('get')
    print('json',request.get_json(force=True))
    return jsonify({"success" : True, "message" : None})


if __name__ == '__main__':
    model = torch.hub.load('ultralytics/yolov5','custom', path = 'weights/yolo_m.pt', force_reload=True)
    model.conf = 0.65

    app.run(debug=True,use_reloader=False, host='0.0.0.0', port=80)
