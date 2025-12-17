import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';

const uploadsPath = process.env.UPLOADS_PATH || './uploads/consumo-images';

// Asegurar que el directorio existe
if (!existsSync(uploadsPath)) {
  mkdirSync(uploadsPath, { recursive: true });
}

export const multerConfig = {
  storage: diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: Function) => {
      // Obtener empresa_id del usuario autenticado
      const empresaId = (req.user as any)?.empresaId || 'default';

      // IMPORTANTE: año y mes se pasan como query params o body
      // Los extraeremos del request para crear la estructura de carpetas
      const year = req.body.year || new Date().getFullYear();
      const month = req.body.mes || (new Date().getMonth() + 1);

      // Estructura: empresa_{id}/año/mes/
      const empresaPath = join(
        uploadsPath,
        `empresa_${empresaId}`,
        year.toString(),
        month.toString().padStart(2, '0')
      );

      // Crear estructura de carpetas si no existe
      if (!existsSync(empresaPath)) {
        mkdirSync(empresaPath, { recursive: true });
      }

      cb(null, empresaPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb: Function) => {
      // Filename será sobrescrito en el controller con datos del consumo
      const randomName = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `temp-${randomName}${extname(file.originalname)}`);
    }
  }),
  fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
    // Solo permitir imágenes JPEG/JPG
    if (!file.mimetype.match(/\/(jpg|jpeg)$/)) {
      return cb(new Error('Solo se permiten archivos JPEG'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
};
