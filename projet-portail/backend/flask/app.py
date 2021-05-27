from werkzeug.utils import secure_filename
from flask import Flask, request
from Predictor import Predict
from flask import jsonify
import tensorflow as tf
import cv2
import os

pred = Predict()
# UPLOAD_FOLDER = '/uploads'
# ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app = Flask(__name__)
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# def allowed_file(filename):
#     return '.' in filename and \
#            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def hello_world():
    return 'Hello, World!!'

@app.route('/detect', methods=['POST', 'GET'])
def detect():
    if request.method == 'POST':
        result = {}
        # get and save uploaded image
        f = request.files.get('file')
        fname = request.form.get('filename')
        basepath = os.path.dirname(__file__)
        file_path = os.path.join(basepath, 'uploads', fname)
        f.save(file_path)
        # read and preprocess image
        img = cv2.imread(file_path)
        resized = cv2.resize(img, (224, 224))
        expanded = tf.expand_dims(resized, axis=0)
        # get prediction
        res = pred.classifyImage(expanded)
        if res[0] == 1.0:
            breed = pred.getCatBreed(pred.predictCatBreed(expanded))
            result['status'] = 0
            result['msg'] = breed
        elif res[1] == 1.0:
            resized = cv2.resize(img, (331, 331))
            expanded = tf.expand_dims(resized, axis=0)
            breed = pred.getDogBreed(pred.predictDogBreed(expanded))
            result['status'] = 1
            result['msg'] = breed
        else:
            result['status'] = -1
            result['msg'] = 'upload another picture'
        return jsonify(result)


if __name__ == '__main__':
    app.run()