import os
import boto3
from uuid import uuid4
from botocore.exceptions import NoCredentialsError, ClientError
from io import BytesIO
from fastapi import HTTPException, UploadFile
from starlette.concurrency import run_in_threadpool
import logging
from app.core.config import AWS_S3_BUCKET_NAME, AWS_CLOUDFRONT_URL

# Set up logger
logger = logging.getLogger(__name__)

# Get AWS configuration from environment
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Log configuration status (without exposing secrets)
if AWS_ACCESS_KEY and AWS_SECRET_KEY:
    logger.info(f"AWS credentials found in environment variables")
else:
    logger.warning(f"AWS credentials not found in environment variables. Falling back to AWS config file or IAM role.")

try:
    # Initialize S3 client with explicit credentials if available
    if AWS_ACCESS_KEY and AWS_SECRET_KEY:
        s3_client = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY
        )
    else:
        # Fall back to credentials file or IAM role
        s3_client = boto3.client('s3', region_name=AWS_REGION)
        
    # Test the connection
    s3_client.list_buckets()
    logger.info(f"S3 client successfully initialized with region: {AWS_REGION}, bucket: {AWS_S3_BUCKET_NAME}")
except Exception as e:
    logger.error(f"Failed to initialize or test S3 client: {str(e)}")
    s3_client = None

async def upload_image_to_s3(file: UploadFile, folder="profiles") -> str:
    """
    Upload a file object to S3
    """
    try:
        # Log the upload attempt
        logger.info(f"Uploading file to S3: {file.filename}, content_type: {file.content_type}")
            
        # Check if S3 client is initialized
        if not s3_client:
            logger.error("S3 client is not initialized")
            raise HTTPException(
                status_code=500,
                detail="S3 service is not properly configured. Check AWS credentials."
            )
            
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{folder}/{uuid4().hex}.{file_extension}"

        try:
            file_content = await file.read()  # Async read!
        except Exception as e:
            error_msg = f"Failed to read file content: {str(e)}"
            logger.error(error_msg)
            raise HTTPException(status_code=500, detail=error_msg)

        if not file_content or len(file_content) == 0:
            error_msg = "Uploaded file is empty."
            logger.error(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)

        file_stream = BytesIO(file_content)

        await run_in_threadpool(
            s3_client.upload_fileobj,
            file_stream,
            AWS_S3_BUCKET_NAME,
            unique_filename,
            ExtraArgs={"ContentType": file.content_type}
        )

        # Generate the URL based on CloudFront availability
        url = (
            f"{AWS_CLOUDFRONT_URL}/{unique_filename}"
            if AWS_CLOUDFRONT_URL
            else f"https://{AWS_S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"
        )
        logger.info(f"File uploaded successfully. URL: {url}")
        return unique_filename.split('/')[-1]  # Return just the filename

    except NoCredentialsError:
        error_msg = "AWS credentials are invalid or not found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables."
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Image upload failed: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    finally:
        await file.seek(0)  # Reset file cursor

async def upload_base64_image_to_s3(base64_image: str, file_extension: str = "jpg", folder="profiles") -> str:
    """
    Upload a base64 encoded image to S3
    """
    try:
        import base64
        
        # Log the upload attempt
        logger.info(f"Uploading base64 image to S3 with extension: {file_extension}")
            
        # Check if S3 client is initialized
        if not s3_client:
            logger.error("S3 client is not initialized")
            raise HTTPException(
                status_code=500,
                detail="S3 service is not properly configured. Check AWS credentials."
            )
        
        # Check if AWS_S3_BUCKET_NAME is configured
        if not AWS_S3_BUCKET_NAME:
            logger.error("AWS_S3_BUCKET_NAME is not configured")
            raise HTTPException(
                status_code=500,
                detail="S3 bucket name is not configured. Set AWS_S3_BUCKET_NAME environment variable."
            )
            
        # Decode base64 string
        if "base64," in base64_image:
            base64_image = base64_image.split("base64,")[1]
        
        try:
            file_content = base64.b64decode(base64_image)
        except Exception as e:
            error_msg = f"Failed to decode base64 image: {str(e)}"
            logger.error(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
        if not file_content or len(file_content) == 0:
            error_msg = "Decoded base64 image is empty."
            logger.error(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
        unique_filename = f"{folder}/{uuid4().hex}.{file_extension}"
        file_stream = BytesIO(file_content)
        
        # Map common file extensions to MIME types
        content_type_map = {
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "png": "image/png",
            "gif": "image/gif",
            "webp": "image/webp",
            "svg": "image/svg+xml",
            "bmp": "image/bmp"
        }
        
        # Get the appropriate content type or default to generic image
        content_type = content_type_map.get(file_extension.lower(), f"image/{file_extension}")
        
        # For debugging purposes
        logger.info(f"Uploading to bucket: {AWS_S3_BUCKET_NAME}, key: {unique_filename}")
            
        await run_in_threadpool(
            s3_client.upload_fileobj,
            file_stream,
            AWS_S3_BUCKET_NAME,
            unique_filename,
            ExtraArgs={"ContentType": content_type}
        )

        logger.info(f"Base64 image uploaded successfully as: {unique_filename}")
        return unique_filename.split('/')[-1]  # Return just the filename without the folder

    except NoCredentialsError:
        error_msg = "AWS credentials are invalid or not found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables."
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except ClientError as e:
        error_msg = f"AWS S3 client error: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Base64 image upload failed: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

async def delete_file(filename: str, folder="profiles") -> bool:
    """
    Delete a file from S3 by filename
    """
    try:
        logger.info(f"Deleting file from S3: {filename}")
            
        # Check if S3 client is initialized
        if not s3_client:
            logger.error("S3 client is not initialized")
            raise HTTPException(
                status_code=500,
                detail="S3 service is not properly configured. Check AWS credentials."
            )
        
        # Construct the full key with folder
        key = f"{folder}/{filename}"
        
        # Delete the file using async wrapper
        await run_in_threadpool(
            s3_client.delete_object,
            Bucket=AWS_S3_BUCKET_NAME,
            Key=key
        )
        
        logger.info(f"File deleted successfully: {key}")
        return True
        
    except ClientError as e:
        error_msg = f"Failed to delete file from S3: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Unexpected error deleting file: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg) 