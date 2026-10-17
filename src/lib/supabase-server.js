import { createClient } from '@supabase/supabase-js';

// Server-side privileged Supabase client for storage uploads
// NOTE: Kept strictly on server; NEVER use NEXT_PUBLIC_ for secret keys.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'leon-portfolio-asset';

let supabaseClient = null;

export function getSupabaseServerClient() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  return supabaseClient;
}

/**
 * Uploads a validated file buffer to Supabase Storage.
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Sanitized filename
 * @param {string} contentType - MIME type
 * @param {string} bucket - Bucket name
 * @returns {Promise<{ success: boolean, publicUrl?: string, error?: string }>}
 */
export async function uploadToSupabaseStorage(buffer, filename, contentType, bucket) {
  const targetBucket = bucket || process.env.SUPABASE_STORAGE_BUCKET || 'leon-portfolio-asset';
  const client = getSupabaseServerClient();
  if (!client) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in environment variables.');
    }
    return { success: false, error: 'Supabase client not configured' };
  }

  try {
    // Attempt upload with upsert enabled
    const { data, error } = await client.storage
      .from(targetBucket)
      .upload(filename, buffer, {
        contentType,
        upsert: true,
        cacheControl: '31536000'
      });

    if (error) {
      console.error('Supabase Storage Upload Error:', error);
      return { success: false, error: error.message };
    }

    // Retrieve public URL
    const { data: urlData } = client.storage
      .from(targetBucket)
      .getPublicUrl(filename);

    return {
      success: true,
      publicUrl: urlData.publicUrl,
      path: data.path
    };
  } catch (err) {
    console.error('Failed to upload to Supabase Storage:', err);
    return { success: false, error: err.message };
  }
}
