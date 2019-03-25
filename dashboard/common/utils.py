import logging, os
logger = logging.getLogger(__name__)

def get_build_info():
    logger.debug(get_build_info.__name__)
<<<<<<< HEAD
    git_commit=os.getenv("OPENSHIFT_BUILD_COMMIT", "")
    build_namespace=os.getenv("OPENSHIFT_BUILD_NAMESPACE", "")
    git_branch=os.getenv("OPENSHIFT_BUILD_REFERENCE", "master")
    build_source=os.getenv("OPENSHIFT_BUILD_SOURCE", "")
    build_name=os.getenv("OPENSHIFT_BUILD_NAME", "")
=======
    git_commit=config("OPENSHIFT_BUILD_COMMIT",default="")
    build_namespace=config("OPENSHIFT_BUILD_NAMESPACE",default="")
    git_branch=config("OPENSHIFT_BUILD_REFERENCE",default="master")
    build_source=config("OPENSHIFT_BUILD_SOURCE",default="")
    build_name=config("OPENSHIFT_BUILD_NAME",default="")
>>>>>>> 4881dd7... Merging master changes into react (#467)
    return f'Build_Namespace:{build_namespace} Build_Name: {build_name} Git_Source: {build_source} Git_Branch: {git_branch} Git_Commit: {git_commit}'

