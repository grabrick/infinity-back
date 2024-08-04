import { diskStorage } from 'multer';
import { extname } from 'path';

// Определение допустимых аудиоформатов
const audioFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(mp3|m4a|wav|flac)$/)) {
    return callback(new Error('Only audio files are allowed!'), false);
  }
  callback(null, true);
};

// Настройка места и имени файла
const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const multerOptions = {
  storage,
  fileFilter: audioFileFilter,
};
