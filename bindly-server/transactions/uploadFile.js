const { supabase } = require('../initSupabase');

const uploadFile = async (fileData, bucketName, fileName, timestamp, newTimeStamp) => {
    let fileUrl = "";
    let fileExt = "jpg"; // Default to jpg, you may want to handle different file types based on the Base64 string

    try {
        if (fileData) {
            // Extract the file extension from the Base64 data
            const match = fileData.match(/^data:image\/(\w+);base64,/);
            if (match) {
                fileExt = match[1];
                fileData = fileData.replace(/^data:image\/\w+;base64,/, "");
            }

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

            const { data: imageData, error: imageError } = await supabase.storage
                .from(bucketName)
                .upload(`${fileName}-${newTimeStamp}.${fileExt}`, buffer, {
                    contentType: `image/${fileExt}`,
                    upsert: true,
                });

            if (imageError) {
                console.error('Error uploading file:', imageError);
                return { fileUrl: null, error: imageError };
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
}

module.exports = {uploadFile};
