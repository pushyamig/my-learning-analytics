import os
import logging

import hjson, json
import pandas as pd
from sqlalchemy import create_engine

logging.basicConfig()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def format_df(df):
    return '\n'+ df.to_string()

def compare_udp_prod_vs_sits_df(udp_query_string, udp_prod_engine, udp_sits_engine, query_params):
    udp_prod_df = pd.read_sql(
        udp_query_string, udp_prod_engine, params=query_params)
    # logger.info(f"Total Records udp_prod df: {udp_prod_df.shape}" )

    udp_sits_df = pd.read_sql(
        udp_query_string, udp_sits_engine, params=query_params)
    # logger.info(f"Total Records udp_sits df: {udp_sits_df.shape} ")

    # Debug out the data frames
    logger.debug("UDP Prod Dataframe:")
    logger.debug(format_df(udp_prod_df))
    logger.debug("\n\nUDP Sits Dataframe:")
    logger.debug(format_df(udp_sits_df))

    # df_diff = pd.concat([udp_prod_df, udp_sits_df]).drop_duplicates(keep=False)
    # if df_diff.empty:
    #     logger.info("No differences found")
    # else:
    #     logger.info("Differences found. Different records:")
    #     logger.info(format_df(df_diff))
    merged = pd.merge(udp_prod_df, udp_sits_df, how='outer', indicator=True)
    if (merged['_merge'] == 'both').all():
        print("No differences found")
    else:
        print("DataFrames are different.")
        merged['_merge'] = merged['_merge'].replace({'left_only': 'prod_only', 'right_only': 'sits_only', 'both': 'common_in_both'})

        udp_prod_df = merged[merged['_merge'] == 'prod_only']
        logger.info(format_df(udp_prod_df))
        udp_sits_df = merged[merged['_merge'] == 'sits_only']
        logger.info(format_df(udp_sits_df))
        only_in_both = merged[merged['_merge'] == 'common_in_both']
        logger.info(f'Records common in both: {only_in_both.shape}')

    # assert that the two dataframes are the same but continue even if they're not
    try:
        pd.testing.assert_frame_equal(udp_prod_df, udp_sits_df, check_dtype=False, check_exact=False, rtol=1e-02, atol=1e-03)
    except AssertionError as e:
        logger.error(e)

def get_db_engine(connection_json):
    db_name = connection_json['NAME']
    db_user = connection_json['USER']
    db_password = connection_json['PASSWORD']
    db_host = connection_json['HOST']
    db_port = connection_json['PORT']
    db_engine = create_engine("postgresql://{user}:{password}@{host}:{port}/{db}"
                              .format(db=db_name,
                                      user=db_user,
                                      password=db_password,
                                      host=db_host,
                                      port=db_port))
    return db_engine


def get_env_file(env_file_name, json_or_hjson):
    # Set up ENV
    # CONFIG_PATH = os.path.join(os.path.dirname(
    #    os.path.abspath('__file__')), env_file_name)
    CONFIG_PATH = env_file_name
    try:
        with open(CONFIG_PATH) as env_file:
            if json_or_hjson == "json":
                ENV = json.load(env_file)
            else:
                ENV = hjson.load(env_file)
    except FileNotFoundError:
        logger.error(
            f'Configuration file could not be found; please add file "{CONFIG_PATH}".')
        ENV = dict()
    return ENV


def main():
    """
    Get the configuration file
    """

    # Set up ENV for both UDW and UDP
    dir_path = os.path.dirname(os.path.realpath(__file__))
    logger.debug(dir_path)
    logger.debug(os.path.abspath(os.path.abspath(os.pardir)))
    ENV_UDP_PROD = get_env_file('/secrets/env_udp_prod.hjson', 'hjson')
    ENV_UDP_SITS = get_env_file('/secrets/env_udp_sits.hjson', 'hjson')

    # Use the config files in this project
    ENV_CRON_UDP = get_env_file('/code/config/cron_udp.hjson', 'hjson')
    ENV_VALIDATION = get_env_file(
        os.path.join(os.path.dirname(os.path.abspath('__file__')), 'env_validation.hjson'), 'hjson')

    udp_prod_engine = get_db_engine(ENV_UDP_PROD['DATA_WAREHOUSE'])
    udp_sits_engine = get_db_engine(ENV_UDP_SITS['DATA_WAREHOUSE'])

    DATA_WAREHOUSE_COURSE_IDS = ENV_VALIDATION["DATA_WAREHOUSE_COURSE_IDS"]

    CANVAS_DATA_ID_INCREMENT = ENV_VALIDATION["CANVAS_DATA_ID_INCREMENT"]

    # from the configuration variable
    # load the queries based on UDP and UDW tables
    # run queries and compare the returned dataframes
    for query_type in ENV_CRON_UDP:
        if query_type == "metadata" or query_type == "term":
            continue
        # if query_type == "submission":
        logger.info('\n\n ------------------------')
        logger.info(f'Comparing query {query_type}:')
        query_params = {
            "course_ids": tuple(DATA_WAREHOUSE_COURSE_IDS),
            'canvas_data_id_increment': CANVAS_DATA_ID_INCREMENT,
            'time_zone': "America/Detroit"
        }

        compare_udp_prod_vs_sits_df(ENV_CRON_UDP[query_type], udp_prod_engine, udp_sits_engine, query_params)


if __name__ == "__main__":
    main()
