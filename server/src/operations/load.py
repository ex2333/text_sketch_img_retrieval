import sys
import os
import os.path as osp
from diskcache import Cache
from config import DEFAULT_TABLE, BATCH_SIZE, DEVICE, NUM_WORKERS
from logs import LOGGER
from milvus_helpers import MilvusHelper
from mysql_helpers import MySQLHelper
from encode import TaskFormer

from torch.utils.data import Dataset, DataLoader
from PIL import Image


class ImgDataBase(Dataset):
    def __init__(self, img_dir, transformers):
        super().__init__()
        self.img_files = get_imgs(img_dir)
        self.transformers = transformers
        self.img_files = sorted(self.img_files)
        self.files_iter = iter(self.img_files)

    def __len__(self):
        return len(self.img_files)

    def __getitem__(self, index):
        img_file = next(self.files_iter)
        img = Image.open(img_file)
        try:
            img = self.transformers(img)
        except Exception as e:
            LOGGER.error(f"{img_file}: {e}")
            return self.__getitem__(index)
        return img, img_file


# Get the path to the image
def get_imgs(path):
    pics = []
    for root, dirs, files in os.walk(path):
        for f in files:
            extension = osp.splitext(f)[-1]
            if (extension in ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'] and not f.startswith('.DS_Store')):
                pics.append(os.path.join(root, f))

    return pics


# Get the vector of images
def extract_features(img_dir, model: TaskFormer):
    try:
        cache = Cache('./tmp')
        feats = []
        names = []
        img_files = get_imgs(img_dir)
        total = len(img_files)
        cache['total'] = total
        if total < 200:
            for i, img_file in enumerate(img_files):
                try:
                    img = Image.open(img_file)
                    feat = model.extract_img_feat(img, preprocess=True)
                    feats.append(feat.reshape(-1).cpu().numpy())
                    names.append(img_file.encode())
                    cache['current'] = i + 1
                    LOGGER.info(f"Extracting feature from image No. {i + 1} , {total} images in total")
                except Exception as e:
                    LOGGER.error(e)
                    cache['total'] -= 1
                    total -= 1
                    continue
        else:
            dataset = ImgDataBase(img_dir, model.img_preprocess)
            dataloader = DataLoader(
                dataset,
                batch_size=BATCH_SIZE,
                shuffle=False,
                num_workers=NUM_WORKERS,
                pin_memory=True,
                sampler=None,
                drop_last=False
            )
            for i, batch in enumerate(dataloader):
                try:
                    imgs, img_paths = batch
                    feas = model.extract_img_feat(imgs.to(DEVICE), preprocess=False)
                    feas = feas.cpu().numpy()
                    for j, (f, p) in enumerate(zip(feas, img_paths)):
                        feats.append(f.reshape(-1))
                        names.append(p.encode())
                        curr = i * BATCH_SIZE + j
                        cache['current'] = curr
                    LOGGER.info(f"Extracting feature from image No. {curr} , {total} images in total")
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
    mysql_cli.create_mysql_table(table_name)
    vectors, names = extract_features(image_dir, model)
    total = 0
    for v, n in zip(vectors, names):
        # if mysql_cli.if_exist(table_name, n):
        #     continue
        # else:
        id_ = milvus_client.insert(table_name, [v])[0]
        mysql_cli.load_data_to_mysql(table_name, format_data([id_], [n]))
        total += 1
    return total
