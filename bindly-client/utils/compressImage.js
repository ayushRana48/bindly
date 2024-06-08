import { manipulateAsync } from 'expo-image-manipulator';



export default compressImage = async (uri) => {
    const compressed = await manipulateAsync(
        uri,
        [{ resize: { width: 300 } }] // Adjust width as needed
    );
    // return uri
    return compressed.uri;
};


