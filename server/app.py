import io
import os
import torch
from io import BytesIO
from PIL import Image
from zipfile import ZipFile
from flask_cors import CORS
from flask import Flask, render_template, request, make_response, jsonify, send_file


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content_Type'

model = torch.hub.load('ultralytics/yolov5','custom',path = 'weights/yolo_m.pt', force_reload=True)
model.conf = 0.5

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
    15: 'lapel'
}

highTops = [4,9,3,2,5,9,10,11,12,14,15]
lowTops = [0,1]
bottoms = [6,7,8,13]


@app.route('/detect',methods=['POST'])
def detect():
    anotts = []
    top = True
    bottom = True
    if 'file' not in request.files:
        return 'Missing file',400
    file = request.files['file']
    if file.filename == '':
        return 'No file',400

    img_bytes = file.read()
    img = Image.open(io.BytesIO(img_bytes))
    result = model(img, size=640)
    for tens in result.xyxy[0] :
        anottClass = int(tens[5])
        if top :
            if anottClass in highTops :
                anotts.append([int(tens[0]),int(tens[1]),int(tens[2]),int(tens[3]),float(tens[4]),anottClass])
                top = False
            elif anottClass in lowTops :
                anotts.append([int(tens[0]),int(tens[1]),int(tens[2]),int(tens[3]),float(tens[4]),anottClass])
                top = False
        if bottom :
            if anottClass in bottoms :
                anotts.append([int(tens[0]),int(tens[1]),int(tens[2]),int(tens[3]),float(tens[4]),anottClass])
                bottom : False

    splices = []
    stream = BytesIO()
    format = img.format

    with ZipFile(stream, 'w') as zf:
        for i in range(len(anotts)):
            x0, y0, x1, y1, conf, cl = anotts[i]
            cropped = img.copy()
            cropped = cropped.crop((int(x0),int(y0),int(x1),int(y1)))
            strimi = BytesIO()
            cropped.save(strimi,img.format)
            cropped.close()
            splices.append(cropped)
            print(categoriesDic[cl]+'.'+format)
            zf.writestr(categoriesDic[cl]+'.jpg',strimi.getvalue())
    stream.seek(0)

    with open('zipo.zip','wb') as f:
        f.write(stream.getbuffer())
    return send_file(stream, download_name = 'results.zip', as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=80)
