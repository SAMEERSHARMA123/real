const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const uploadToCloudinary = async (file) => {
//   const { createReadStream } = await file;

//   return new Promise(async (resolve, reject) => {
//     try {
//       // Step 1: Convert stream to buffer
//       const chunks = [];
//       const stream = createReadStream();
//       for await (const chunk of stream) {
//         chunks.push(chunk);
//       }
//       const buffer = Buffer.concat(chunks);

//       // Step 2: Resize image with sharp
//       const optimizedBuffer = await sharp(buffer)
//         .resize({ width: 600, height: 800, fit: 'inside' })
//         .jpeg({ quality: 70 }) // reduce size more
//         .toBuffer();

//       // Step 3: Upload to Cloudinary using streamifier
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           resource_type: 'image',
//           folder: 'posts', // Optional
//           format: 'jpg',
//         },
//         (err, result) => {
//           if (err) {
//             console.error('❌ Cloudinary Upload Error:', err);
//             reject(err);
//           } else {
//             console.log('✅ Cloudinary Upload Success:', result.secure_url);
//             resolve(result.secure_url);
//           }
//         }
//       );

//       streamifier.createReadStream(optimizedBuffer).pipe(uploadStream);
//     } catch (err) {
//       console.error('❌ Error during image resize/upload:', err);
//       reject(err);
//     }
//   });
// };

// module.exports = { uploadToCloudinary };







const uploadToCloudinary = async (file, type = 'image') => {
  const { createReadStream, filename, mimetype } = await file;

  return new Promise(async (resolve, reject) => {
    try {
      const stream = createReadStream();
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      let uploadBuffer = buffer;
      let format = undefined;

      // ✅ Only process images with sharp
      if (type === 'image') {
        uploadBuffer = await sharp(buffer)
          .resize({ width: 600, height: 800, fit: 'inside' })
          .jpeg({ quality: 70 })
          .toBuffer();
        format = 'jpg';
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: type, // 'image' or 'video'
          folder: 'posts',
          format: format, // only used for image
        },
        (err, result) => {
          if (err) {
            console.error('❌ Cloudinary Upload Error:', err);
            reject(err);
          } else {
            console.log('✅ Cloudinary Upload Success:', result.secure_url);
            resolve(result.secure_url);
          }
        }
      );

      streamifier.createReadStream(uploadBuffer).pipe(uploadStream);
    } catch (err) {
      console.error('❌ Error during Cloudinary upload:', err);
      reject(err);
    }
  });
};

 module.exports = { uploadToCloudinary };
