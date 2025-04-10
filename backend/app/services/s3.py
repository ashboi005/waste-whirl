import os
import logging
import boto3
from uuid import uuid4
from botocore.exceptions import NoCredentialsError, ClientError
from io import BytesIO
from fastapi import HTTPException, UploadFile, status
from starlette.concurrency import run_in_threadpool
import base64

# Try to load .env only in development
try:
    # Check if we're in a Lambda environment
    if os.environ.get('AWS_LAMBDA_FUNCTION_NAME') is None:
        try:
            from dotenv import load_dotenv
            load_dotenv()
            print("Loaded .env file for local development")
        except ImportError:
            print("dotenv module not found. Skipping .env loading.")
        except Exception as e:
            print(f"Warning: Error loading .env file: {str(e)}")

except Exception as e:
    print(f"Error checking environment: {str(e)}")

# Set up logger
logger = logging.getLogger(__name__)

# Get AWS configuration from environment
AWS_REGION = os.getenv("AWS_REGION")
AWS_S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET_NAME") or os.getenv("AWS_BUCKET_NAME")
AWS_CLOUDFRONT_URL = os.getenv("AWS_CLOUDFRONT_URL")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Log configuration status (for debugging, without exposing secrets)
logger.info(f"AWS Configuration - Region: {'Set' if AWS_REGION else 'Not Set'}")
logger.info(f"AWS Configuration - Bucket: {'Set' if AWS_S3_BUCKET_NAME else 'Not Set'}")
logger.info(f"AWS Configuration - CloudFront: {'Set' if AWS_CLOUDFRONT_URL else 'Not Set'}")
logger.info(f"AWS Configuration - Access Key ID: {'Set' if AWS_ACCESS_KEY_ID else 'Not Set'}")
logger.info(f"AWS Configuration - Secret Key: {'Set' if AWS_SECRET_ACCESS_KEY else 'Not Set'}")

# Initialize S3 client based on environment
s3_client = None
try:
    # Check if running in AWS Lambda or EC2 (with IAM role)
    if os.environ.get('AWS_LAMBDA_FUNCTION_NAME') or not (AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY):
        logger.info("Running in AWS environment with IAM role or Lambda execution role")
        s3_client = boto3.client('s3', region_name=AWS_REGION)
    else:
        # Using explicit credentials
        logger.info("Using explicit AWS credentials from environment variables")
        s3_client = boto3.client(
            "s3",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION,
        )
    
    # Test connection
    response = s3_client.list_buckets()
    logger.info(f"Successfully connected to AWS S3. Buckets: {len(response['Buckets'])}")
except Exception as e:
    logger.error(f"Failed to initialize S3 client: {str(e)}")
    # Don't set s3_client to None - keep the instance for simplified error handling

async def upload_image_to_s3(file: UploadFile, folder="profiles") -> str:
    """
    Upload a file object to S3
    """
    try:
        # Log the upload attempt
        logger.info(f"Uploading file to S3: {file.filename}, content_type: {file.content_type}")
            
        # Check if S3 client is initialized
        if s3_client is None:
            logger.error("S3 client is not initialized")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AWS S3 client not initialized. Check AWS credentials and region settings."
            )
        
        # Check if required AWS variables are set
        if not AWS_S3_BUCKET_NAME:
            logger.error("AWS S3 bucket name not configured")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AWS_S3_BUCKET_NAME environment variable is missing"
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
        return url

    except NoCredentialsError:
        error_msg = "AWS credentials are invalid or not found. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables."
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except ClientError as e:
        error_msg = f"AWS client error: {str(e)}"
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
        # Log the upload attempt
        logger.info(f"Uploading base64 image to S3 with extension: {file_extension}")
            
        # Check if S3 client is initialized
        if s3_client is None:
            logger.error("S3 client is not initialized")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AWS S3 client not initialized. Check AWS credentials and region settings."
            )
        
        # Check if required AWS variables are set
        if not AWS_S3_BUCKET_NAME:
            logger.error("AWS S3 bucket name not configured")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AWS_S3_BUCKET_NAME environment variable is missing"
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
        
        logger.info(f"Attempting to upload to S3 bucket: {AWS_S3_BUCKET_NAME}, key: {unique_filename}")
        
        try:
            await run_in_threadpool(
                s3_client.upload_fileobj,
                file_stream,
                AWS_S3_BUCKET_NAME,
                unique_filename,
                ExtraArgs={"ContentType": content_type}
            )
        except Exception as e:
            logger.error(f"S3 upload operation failed: {str(e)}")
            raise

        # Generate the URL based on CloudFront availability
        url = (
            f"{AWS_CLOUDFRONT_URL}/{unique_filename}"
            if AWS_CLOUDFRONT_URL
            else f"https://{AWS_S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"
        )
        logger.info(f"Base64 image uploaded successfully. URL: {url}")
        return url

    except NoCredentialsError:
        error_msg = "AWS credentials are invalid or not found."
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)
    except ClientError as e:
        error_msg = f"AWS client error: {str(e)}"
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
        if s3_client is None:
            logger.error("S3 client is not initialized")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AWS S3 client not initialized. Check AWS credentials and region settings."
            )
        
        # If the filename is a full URL, extract just the filename part
        if filename.startswith(('http://', 'https://')):
            filename = filename.split('/')[-1]
        
        # Construct the full key with folder
        key = f"{folder}/{filename}"
        
        logger.info(f"Deleting S3 object: bucket={AWS_S3_BUCKET_NAME}, key={key}")
        
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

def is_url(text):
    """
    Check if a string is a URL
    
    Args:
        text (str): Text to check
        
    Returns:
        bool: True if text is a URL, False otherwise
    """
    return text and isinstance(text, str) and text.startswith(('http://', 'https://')) 