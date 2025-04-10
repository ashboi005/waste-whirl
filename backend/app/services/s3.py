import boto3
import os
from app.core.config import AWS_S3_BUCKET_NAME, AWS_CLOUDFRONT_URL
from botocore.exceptions import ClientError
from fastapi import HTTPException, UploadFile
import uuid
from typing import Optional, Dict, List, Tuple

class S3Service:
    """
    S3 service for handling file uploads and retrievals
    """
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.bucket_name = AWS_S3_BUCKET_NAME
        self.cloudfront_url = AWS_CLOUDFRONT_URL
        self.allowed_file_types = {
            'image/png': 'png',
            'image/jpeg': 'jpg',
            'image/webp': 'webp',
            'application/pdf': 'pdf'
        }
    
    def generate_presigned_url(self, 
                              content_type: str,
                              folder: str = "profiles",
                              filename: Optional[str] = None) -> Dict[str, str]:
        """
        Generate a presigned URL for direct frontend uploads to S3
        """
        try:
            # Check if content type is allowed
            if content_type not in self.allowed_file_types:
                raise HTTPException(
                    status_code=400, 
                    detail=f"File type not allowed. Allowed types: {', '.join(self.allowed_file_types.values())}"
                )
            
            # Generate a unique filename if not provided
            if not filename:
                ext = self.allowed_file_types[content_type]
                filename = f"{uuid.uuid4()}.{ext}"
            
            # Ensure the folder path is correct
            key = f"{folder}/{filename}"
            
            # Generate presigned URL
            presigned_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': key,
                    'ContentType': content_type
                },
                ExpiresIn=3600  # URL expires in 1 hour
            )
            
            return {
                "presigned_url": presigned_url,
                "key": key,
                "filename": filename
            }
        
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate presigned URL: {str(e)}")
    
    async def upload_file(self, 
                    file: UploadFile, 
                    folder: str = "profiles", 
                    filename: Optional[str] = None) -> str:
        """
        Upload a file to S3 and return only the filename
        """
        try:
            # Check if content type is allowed
            if file.content_type not in self.allowed_file_types:
                raise HTTPException(
                    status_code=400, 
                    detail=f"File type not allowed. Allowed types: {', '.join(self.allowed_file_types.values())}"
                )
            
            # Generate a unique filename if not provided
            if not filename:
                ext = self.allowed_file_types[file.content_type]
                filename = f"{uuid.uuid4()}.{ext}"
            
            # Ensure the folder path is correct
            key = f"{folder}/{filename}"
            
            # Upload the file
            self.s3_client.upload_fileobj(
                file.file, 
                self.bucket_name, 
                key,
                ExtraArgs={"ContentType": file.content_type}
            )
            
            # Return only the filename
            return filename
        
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")
        
        finally:
            # Reset file cursor
            await file.seek(0)
    
    def delete_file(self, url: str) -> bool:
        """
        Delete a file from S3 based on its URL
        """
        try:
            # Extract the key from the URL
            if self.cloudfront_url and self.cloudfront_url in url:
                key = url.split(self.cloudfront_url + '/')[-1]
            else:
                key = url.split(f'{self.bucket_name}.s3.amazonaws.com/')[-1]
            
            # Delete the file
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            
            return True
        
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"S3 delete failed: {str(e)}")


# Singleton instance
s3_service = S3Service() 

# Module-level functions that delegate to the singleton instance
def generate_presigned_url(content_type: str, folder: str = "profiles", filename: Optional[str] = None) -> Dict[str, str]:
    """
    Module-level function that delegates to the S3Service instance
    """
    return s3_service.generate_presigned_url(content_type, folder, filename)

async def upload_file(file: UploadFile, folder: str = "profiles", filename: Optional[str] = None) -> str:
    """
    Module-level function that delegates to the S3Service instance
    """
    return await s3_service.upload_file(file, folder, filename)

def delete_file(url: str) -> bool:
    """
    Module-level function that delegates to the S3Service instance
    """
    return s3_service.delete_file(url) 