import { manipulateAsync } from 'expo-image-manipulator';



export default compressPostImage = async (uri) => {
    const compressed = await manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }], // Adjust width as needed
        { compress: 0.7 }
    );
    // return uri
    return compressed.uri;
};


