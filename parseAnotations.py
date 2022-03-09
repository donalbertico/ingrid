import json
import os
import shutil
import random
import numpy as np
from PIL import Image, ImageDraw
from matplotlib import pyplot as plt
from sklearn.model_selection import train_test_split

f = open('./train/instances_attributes_val2020.json')

anottsJson = json.load(f)
classIds = np.arange(13)
classIds = np.append(classIds,[21,27,29])
class_names = {}
imgsIndexes = []
parsedAnotts = []

# get category names
for ct in anottsJson['categories']:
    if ct['id'] in classIds :
        class_names[ct['name']] = ct['id']

# get annotation of interest
for an in anottsJson['annotations']:
    if an['category_id'] in classIds:
        if an['category_id'] == 21 :
            an['bbox'].insert(0,13)
        elif an['category_id'] == 27 :
            an['bbox'].insert(0,14)
        elif an['category_id'] == 29 :
            an['bbox'].insert(0,15)
        else :
            an['bbox'].insert(0,an['category_id'])
        if an['image_id'] in imgsIndexes:
            indx = imgsIndexes.index(an['image_id'])
            parsedAnotts[indx].append(an['bbox'])
        else :
            imgsIndexes.append(an['image_id'])
            parsedAnotts.append([an['bbox']])

# parse annotations and get them into files
for img in anottsJson['images']:
    if img['id'] in imgsIndexes :
        # shutil.move(os.path.join("train2/all/train", img['file_name']),"train/images")
        index = imgsIndexes.index(img['id'])
        print_buffer = []
        for i in range(len(parsedAnotts[index])):
            anott = parsedAnotts[index][i]
            parsedAnotts[index][i] = [anott[0], anott[1] + (anott[3]/2), anott[2] + (anott[4]/2), anott[3], anott[4]]
            anott = parsedAnotts[index][i]
            print_buffer.append("{} {:.3f} {:.3f} {:.3f} {:.3f}".format(anott[0], anott[1]/img['width'], anott[2]/img['height'], anott[3]/img['width'], anott[4]/img['height']))
        save_file_name = os.path.join("train/train2/labels/val", img['file_name'].replace('jpg','txt'))
        print("\n".join(print_buffer), file = open(save_file_name, 'w'))

f.close()


# partition data
images = [os.path.join('train/images',i) for i in os.listdir('train/images')]
labels = [os.path.join('train/labels',l) for l in os.listdir('train/labels')]

images.sort()
labels.sort()

train_images, val_images , train_labels, val_labels = train_test_split(images,labels, test_size = 0.2, random_state =1)
val_images, test_images, val_labels, test_labels = train_test_split(val_images, val_labels, test_size = 0.5, random_state =1)


def move_files_to_folder(list_of_files, destination_folder):
    for f in list_of_files:
        try:
            shutil.move(f, destination_folder)
        except:
            print(f)
            assert False

move_files_to_folder(train_images, 'train/images/train')
move_files_to_folder(val_images, 'train/images/val')
move_files_to_folder(test_images, 'train/images/test')
move_files_to_folder(train_labels, 'train/labels/train')
move_files_to_folder(val_labels, 'train/labels/val')
move_files_to_folder(test_labels, 'train/labels/test')


# plot notation
random.seed(0)

images = [os.path.join('train/images/test',i) for i in os.listdir('train/images/test')]
labels = [os.path.join('train/labels/test',l) for l in os.listdir('train/labels/test')]

class_names = dict(zip(class_names.values(),class_names.keys()))

def plot_bounding_box(image, annotation_list):
    annotations = np.array(annotation_list)
    w, h = image.size
    plotted_image = ImageDraw.Draw(image)
    transformed_annotations = np.copy(annotations)
    transformed_annotations[:,[1,3]] = annotations[:,[1,3]] * w
    transformed_annotations[:,[2,4]] = annotations[:,[2,4]] * h
    transformed_annotations[:,1] = transformed_annotations[:,1] - (transformed_annotations[:,3]/2)
    transformed_annotations[:,2] = transformed_annotations[:,2] - (transformed_annotations[:,4]/2)
    transformed_annotations[:,3] = transformed_annotations[:,1] + transformed_annotations[:,3]
    transformed_annotations[:,4] = transformed_annotations[:,2] + transformed_annotations[:,4]
    for ann in transformed_annotations:
        obj_cls, x0, y0, x1, y1 = ann
        plotted_image.rectangle(((x0,y0), (x1,y1)))
        plotted_image.text((x0, y0 - 10), class_names[int(obj_cls)])
    plt.imshow(np.array(image))
    plt.show()

label = random.choice(labels)

with open(label, 'r') as file:
    annotations = file.read().split('\n')[:-1]
    annotations = [x.split(" ") for x in annotations]
    annotations = [[float(y) for y in x] for x in annotations]
    print(annotations)

image_f = label.replace('labels','images').replace('txt','jpg')
assert os.path.exists(image_f)

image = Image.open(image_f)

plot_bounding_box(image,annotations)
