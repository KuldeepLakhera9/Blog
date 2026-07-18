import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadBuffer(buffer: Buffer, folder = "blog"): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve(result?.secure_url || "");
      }
    );
    uploadStream.end(buffer);
  });
}

export async function uploadBase64(base64Str: string, folder = "blog"): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64Str, {
      folder,
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary base64 upload error:", error);
    throw error;
  }
}
