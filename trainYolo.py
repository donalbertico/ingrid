import wandb

wandb.init(project="ingrid", entity="donalbertico")

wandb.config = {
    "batch" : 16,
    "epochs" : 3,
    "img" : 640,
    "workers" : 7
}

python train.py --img 640 --batch 16 --epochs 3 --data ../train/ingrid.yaml --weights yolov5s.pt --workers 7  --name ingrid_yolo_1
