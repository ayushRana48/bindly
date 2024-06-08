const { supabase } = require('../initSupabase');

// MIME type to file extension mapping
const mimeToExtension = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov' // Ensure .mov files are correctly handled
};

const uploadFile = async (fileData, bucketName, fileName, timestamp, newTimeStamp) => {
    let fileUrl = "";
    let fileExt = "jpg"; // Default to jpg, but we will detect the type
    let contentType = "image/jpeg"; // Default content type

    try {
        if (fileData) {
            // Extract the MIME type from the Base64 data
            const match = fileData.match(/^data:([^;]+);base64,/);
            if (match) {
                const mimeType = match[1];
                fileExt = mimeToExtension[mimeType] || mimeType.split('/')[1]; // Use mapping or default to the second part of the MIME type
                contentType = mimeType;

                // Remove the Base64 prefix from the data
                fileData = fileData.replace(/^data:[^;]+;base64,/, "");
            }

            // Convert Base64 string to buffer
            const buffer = Buffer.from(fileData, 'base64');

            if (timestamp) {
                const oldFileName = `${fileName}-${timestamp.substring(0, timestamp.length - 6)}Z.${fileExt}`;

                const { error: deleteError } = await supabase.storage
                    .from(bucketName)
                    .remove([oldFileName]);

                if (deleteError && deleteError.message !== 'The resource was not found') {
                    console.error('Error deleting old file:', deleteError);
                    return { fileUrl: null, error: deleteError };
                }
            }

            // Upload new file
            const { data: fd, error: fileError } = await supabase.storage
                .from(bucketName)
                .upload(`${fileName}-${newTimeStamp}.${fileExt}`, buffer, {
                    contentType: contentType,
                    upsert: true,
                });

            if (fileError) {
                console.error('Error uploading file:', fileError);
                return { fileUrl: null, error: fileError };
            } else {
                fileUrl = `https://lxnzgnvhkrgxpfsokwos.supabase.co/storage/v1/object/public/${bucketName}/${fileName}-${newTimeStamp}.${fileExt}`;            
            }
        } else {
            if (timestamp) {
                const oldFileName = `${fileName}-${timestamp}.${fileExt}`;

                const { error: deleteError } = await supabase.storage
                    .from(bucketName)
                    .remove([oldFileName]);

                if (deleteError && deleteError.message !== 'The resource was not found') {
                    console.error('Error deleting old file:', deleteError);
                    return { fileUrl: null, error: deleteError };
                }
            }
        }
    } catch (error) {
        console.error(error);
        return { fileUrl: null, error };
    }

    return { fileUrl, error: null };
};

module.exports = { uploadFile };
