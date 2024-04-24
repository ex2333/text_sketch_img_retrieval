import sys
import os
from diskcache import Cache
from config import DEFAULT_TABLE, BATCH_SIZE, DEVICE
from logs import LOGGER
from milvus_helpers import MilvusHelper
from mysql_helpers import MySQLHelper
from encode import TaskFormer

from torch.utils.data import Dataset, DataLoader
from PIL import Image


class ImgDataBase(Dataset):
    def __init__(self, img_dir, transformers):
        super().__init__()
        self.img_files = []
        self.transformers = transformers
        for root, dirs, files in os.walk(img_dir):
            for f in files:
                if ((f.endswith(extension) for extension in ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']) and not f.startswith('.DS_Store')):
                    self.img_files.append(os.path.join(root, f))
        self.img_files.sort()

    def __len__(self):
        return len(self.img_files)

    def __getitem__(self, index):
        img_file = self.img_files[index]
        img = Image.open(img_file)
        return self.transformers(img), img_file


# Get the path to the image
def get_imgs(path):
    pics = []
    for root, dirs, files in os.walk(path):
        for f in files:
            if ((f.endswith(extension) for extension in ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']) and not f.startswith('.DS_Store')):
                pics.append(os.path.join(root, f))

    return pics


# Get the vector of images
def extract_features(img_dir, model):
    try:
        cache = Cache('./tmp')
        feats = []
        names = []
        dataset = ImgDataBase(img_dir, model.img_preprocess)
        total = len(dataset)
        cache['total'] = total
        dataloader = DataLoader(
            dataset,
            batch_size=BATCH_SIZE,
            shuffle=False,
            num_workers=2,
            pin_memory=True,
            sampler=None,
            drop_last=False
        )
        for i, batch in enumerate(dataloader):
            try:
                imgs, img_paths = batch
                feas = model.extract_database_feat(imgs.to(DEVICE))
                feas = feas.cpu().numpy()
                for f, p in zip(feas, img_paths):
                    feats.append(f.reshape(-1))
                    names.append(p.encode())
                cache['current'] = (i + 1) * imgs.shape[0]
                LOGGER.info(f"Extracting feature from image No. {(i + 1) * imgs.shape[0]} , {total} images in total")
            except Exception as e:
                LOGGER.error(f"Error with extracting feature from image {e}")
                continue
        return feats, names
    except Exception as e:
        LOGGER.error(f"Error with extracting feature from image {e}")
        sys.exit(1)


# Combine the id of the vector and the name of the image into a list
def format_data(ids, names):
    data = [(str(i), n) for i, n in zip(ids, names)]
    return data


# Import vectors to Milvus and data to Mysql respectively
def do_load(table_name: str, image_dir: str, model: TaskFormer, milvus_client: MilvusHelper, mysql_cli: MySQLHelper):
    if not table_name:
        table_name = DEFAULT_TABLE
    if not milvus_client.has_collection(table_name):
        milvus_client.create_collection(table_name)
        milvus_client.create_index(table_name)
    vectors, names = extract_features(image_dir, model)
    ids = milvus_client.insert(table_name, vectors)
    mysql_cli.create_mysql_table(table_name)
    mysql_cli.load_data_to_mysql(table_name, format_data(ids, names))
    return len(ids)
