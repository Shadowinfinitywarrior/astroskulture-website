import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import dns from 'dns';

// Force Node to resolve IPv4 first (prevents timeouts on IPv6-unsupported networks)
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Fix for ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const imagePath = '/home/darkdevil404/.gemini/antigravity/brain/9b496ae7-87af-42d7-9294-34f397127ce0/test_design_1782226108423.png';
const folderName = process.env.CLOUDINARY_FOLDER || 'cf7a6f7a0c891c72efcc48041e47f299f8';

console.log('🔗 Uploading test image to Cloudinary...');
console.log('📂 Source file:', imagePath);
console.log('☁️ Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('📁 Destination Folder:', folderName);

try {
  const result = await cloudinary.uploader.upload(imagePath, {
    folder: folderName
  });

  console.log('\n✅ Upload Successful!');
  console.log('═'.repeat(40));
  console.log('Asset ID:', result.asset_id);
  console.log('Public ID:', result.public_id);
  console.log('Secure URL:', result.secure_url);
  console.log('Folder:', result.folder);
  console.log('Format:', result.format);
  console.log('Dimensions:', `${result.width}x${result.height}`);
  console.log('═'.repeat(40));
} catch (error) {
  console.error('\n❌ Upload Failed!');
  console.error(error);
}
