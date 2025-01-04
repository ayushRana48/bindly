import { supabase } from '../initSupabase';

interface MimeMapping {
  [key: string]: string;
}

interface UploadResponse {
  fileUrl: string | null;
  error: Error | null;
}

const mimeToExtension: MimeMapping = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov'
};

export const uploadFile = async (
  fileData: string,
  bucketName: string,
  fileName: string,
  timestamp: string | null,
  newTimeStamp: string
): Promise<UploadResponse> => {
  let fileUrl = "";
  let fileExt = "jpg";
  let contentType = "image/jpeg";

  try {
    if (fileData) {
      const match = fileData.match(/^data:([^;]+);base64,/);
      if (match) {
        const mimeType = match[1];
        fileExt = mimeToExtension[mimeType] || mimeType.split('/')[1];
        contentType = mimeType;
        fileData = fileData.replace(/^data:[^;]+;base64,/, "");
      }

      const buffer = Buffer.from(fileData, 'base64');

      if (timestamp) {
        const oldFileName = `${fileName}-${timestamp.substring(0, timestamp.length - 6)}Z.${fileExt}`;

        const { error: deleteError } = await supabase.storage
          .from(bucketName)
          .remove([oldFileName]);

        if (deleteError && deleteError.message !== 'The resource was not found') {
          return { fileUrl: null, error: deleteError };
        }
      }

      const { data: fd, error: fileError } = await supabase.storage
        .from(bucketName)
        .upload(`${fileName}-${newTimeStamp}.${fileExt}`, buffer, {
          contentType: contentType,
          upsert: true,
        });

      if (fileError) {
        return { fileUrl: null, error: fileError };
      }

      fileUrl = `https://lxnzgnvhkrgxpfsokwos.supabase.co/storage/v1/object/public/${bucketName}/${fileName}-${newTimeStamp}.${fileExt}`;
    } else if (timestamp) {
      const oldFileName = `${fileName}-${timestamp}.${fileExt}`;

      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove([oldFileName]);

      if (deleteError && deleteError.message !== 'The resource was not found') {
        return { fileUrl: null, error: deleteError };
      }
    }

    return { fileUrl, error: null };
  } catch (error) {
    return { fileUrl: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};