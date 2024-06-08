import { manipulateAsync } from 'expo-image-manipulator';



export default compressPostImage = async (uri) => {
    const compressed = await manipulateAsync(
        uri,
        [{ resize: { width: 800 } }] // Adjust width as needed
    );
    // return uri
    return compressed.uri;
};


