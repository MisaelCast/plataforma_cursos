-- Usuarios autenticados pueden leer archivos del bucket recursos
CREATE POLICY "Leer recursos autenticados"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'recursos');

-- Solo admin puede subir archivos
CREATE POLICY "Admin puede subir recursos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recursos'
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Solo admin puede eliminar archivos
CREATE POLICY "Admin puede eliminar recursos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recursos'
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);