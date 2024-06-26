import sys
from config import DEFAULT_TABLE
from logs import LOGGER
from milvus_helpers import MilvusHelper
from mysql_helpers import MySQLHelper
from encode import TaskFormer

def do_upload(table_name: str, img_path: str, model: TaskFormer, milvus_client: MilvusHelper, mysql_cli: MySQLHelper):
    try:
        if not table_name:
            table_name = DEFAULT_TABLE
        if not milvus_client.has_collection(table_name):
            milvus_client.create_collection(table_name)
            milvus_client.create_index(table_name)
        feat = model.extract_query_feat(None, img_path).reshape(-1).cpu().numpy()
        ids = milvus_client.insert(table_name, [feat])
        mysql_cli.create_mysql_table(table_name)
        mysql_cli.load_data_to_mysql(table_name, [(str(ids[0]), img_path.encode())])
        return ids[0]
    except Exception as e:
        LOGGER.error(f"Error with upload : {e}")
        sys.exit(1)
