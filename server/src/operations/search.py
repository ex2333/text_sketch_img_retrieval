import sys
from config import DEFAULT_TABLE
from logs import LOGGER
from milvus_helpers import MilvusHelper
from mysql_helpers import MySQLHelper
from encode import TaskFormer


def do_search(table_name: str, text_query: str, img_path: str, top_k: int, model: TaskFormer, milvus_client: MilvusHelper, mysql_cli: MySQLHelper):
    try:
        if not table_name:
            table_name = DEFAULT_TABLE
        feat = model.extract_query_feat(text_query, img_path)
        vectors = milvus_client.search_vectors(table_name, [feat.reshape(-1).cpu().numpy()], top_k)
        vids = [str(x.id) for x in vectors[0]]
        paths = mysql_cli.search_by_milvus_ids(vids, table_name)
        distances = [x.distance for x in vectors[0]]
        return paths, distances
    except Exception as e:
        LOGGER.error(f"Error with search : {e}")
        sys.exit(1)
