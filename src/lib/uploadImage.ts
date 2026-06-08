import { supabase } from '@/lib/supabase';

async function compressImage(file: File, maxKB = 500): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, Math.sqrt((maxKB * 1024) / file.size));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Image compression failed'));
        },
        'image/webp',
        0.85,
      );
    };
    img.onerror = () => reject(new Error('Could not load image'));
  });
}

export async function uploadListingImage(listingId: string, file: File): Promise<string> {
  const compressed = await compressImage(file);
  const path = `${listingId}/${Date.now()}.webp`;

  const { error } = await supabase.storage
    .from('produce-images')
    .upload(path, compressed, { contentType: 'image/webp', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('produce-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatar(clerkUserId: string, file: File): Promise<string> {
  const compressed = await compressImage(file, 200);
  const path = `${clerkUserId}/avatar.webp`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, compressed, { contentType: 'image/webp', upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}
