const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format non supporté. Utilisez JPG, PNG ou WEBP'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

const optimizeImage = async (file, filename) => {
  const uploadPath = path.join(__dirname, '../public/uploads');
  
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  
  const imagePath = path.join(uploadPath, filename);
  
  await sharp(file.buffer)
    .resize(800, 600, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 80 })
    .toFile(imagePath);
  
  return `/uploads/${filename}`;
};

module.exports = { upload, optimizeImage };
