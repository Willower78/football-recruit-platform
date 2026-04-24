"""S3 (MinIO) client for uploading/downloading video assets."""

from __future__ import annotations

import os
from typing import BinaryIO

import boto3

from . import config


def _client() -> boto3.client:
    return boto3.client(
        "s3",
        endpoint_url=config.S3_ENDPOINT,
        aws_access_key_id=config.S3_ACCESS_KEY,
        aws_secret_access_key=config.S3_SECRET_KEY,
        region_name="us-east-1",
    )


def download_file(key: str, dest_path: str) -> str:
    """Download *key* from S3 to *dest_path* and return the local path."""
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    _client().download_file(config.S3_BUCKET, key, dest_path)
    return dest_path


def upload_file(local_path: str, key: str) -> str:
    """Upload *local_path* to S3 under *key* and return the S3 URL."""
    _client().upload_file(local_path, config.S3_BUCKET, key)
    return f"{config.S3_ENDPOINT}/{config.S3_BUCKET}/{key}"


def upload_fileobj(fileobj: BinaryIO, key: str) -> str:
    """Upload a file-like object to S3 and return the URL."""
    _client().upload_fileobj(fileobj, config.S3_BUCKET, key)
    return f"{config.S3_ENDPOINT}/{config.S3_BUCKET}/{key}"
