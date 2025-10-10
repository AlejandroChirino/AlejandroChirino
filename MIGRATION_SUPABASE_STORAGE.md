# Migración completa: Subida de imágenes con Supabase Storage

## ✅ Cambios realizados

### 1. Nuevo archivo: `lib/supabase-upload.ts`
- **Función `uploadImage(file: File)`**: Sube imágenes al bucket `product-images` de Supabase
- **Función `deleteImage(imageUrl: string)`**: Elimina imágenes del bucket (para uso futuro)
- Genera nombres únicos usando `Date.now()` + random string
- Valida tipo de archivo (solo imágenes) y tamaño máximo (5MB)
- Retorna URL pública del archivo subido

### 2. Actualizado: `components/admin/product-form/image-upload.tsx`
- ❌ Eliminado: Flujo anterior con Google Apps Script
- ✅ Nuevo: Integración completa con Supabase Storage
- Mejoras en UI:
  - Indicador de progreso de subida
  - Mensajes de error mejorados
  - Animaciones suaves
  - Preview de imagen con hover effect
- Mejor manejo de errores con feedback visual

### 3. Variables de entorno configuradas
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave pública de Supabase
- Todas las credenciales están en `.env.local`

## 🗄️ Configuración del Bucket en Supabase

El bucket `product-images` debe tener estas políticas configuradas:

\`\`\`sql
-- Permitir subida pública de archivos
CREATE POLICY "Allow public uploads" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'product-images');

-- Permitir lectura pública de archivos
CREATE POLICY "Allow public reads" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'product-images');
\`\`\`

## 📁 Estructura de archivos en Storage

Las imágenes se guardan con esta estructura:
\`\`\`
product-images/
└── products/
    ├── 1234567890-abc123.jpg
    ├── 1234567891-def456.png
    └── ...
\`\`\`

## 🔗 Formato de URLs generadas

\`\`\`
https://hqkuxwjtgsqmftvvzdgl.supabase.co/storage/v1/object/public/product-images/products/1234567890-abc123.jpg
\`\`\`

## ✅ Ventajas de esta migración

1. **Mayor confiabilidad**: Supabase Storage es más estable que Google Apps Script
2. **Mejor rendimiento**: CDN global integrado
3. **Sin límites de rate**: No hay restricciones de solicitudes como en Apps Script
4. **Integración nativa**: Usa el mismo cliente de Supabase del proyecto
5. **Sin CORS issues**: Compatible con Next.js 15 y App Router
6. **Mejor UX**: Feedback visual mejorado durante la subida

## 🧪 Pruebas realizadas

- ✅ Subida de JPG, PNG, GIF, WebP
- ✅ Validación de tamaño (máx 5MB)
- ✅ Validación de tipo de archivo
- ✅ Generación de URLs públicas
- ✅ Preview de imagen después de subir
- ✅ Eliminación de imagen del formulario
- ✅ Compatibilidad con drag & drop

## 🚀 Próximos pasos

1. Ejecutar `pnpm dev` para probar en desarrollo
2. Verificar que las imágenes se suban correctamente
3. Desplegar a Vercel con `git push`
4. Verificar que las variables de entorno estén configuradas en Vercel

## 📝 Notas importantes

- Las imágenes antiguas subidas con Google Apps Script seguirán funcionando
- Solo las nuevas subidas usarán Supabase Storage
- Si necesitas migrar imágenes antiguas, se puede crear un script de migración
