const IMAGE_STORAGE_KEY = 'markdown-images';

// Get the entire image store from localStorage
const getImageStore = (): Record<string, string> => {
    try {
        const store = localStorage.getItem(IMAGE_STORAGE_KEY);
        return store ? JSON.parse(store) : {};
    } catch (e) {
        console.error('Failed to parse image store from localStorage', e);
        return {};
    }
};

// Save the entire image store to localStorage
const saveImageStore = (store: Record<string, string>): void => {
    try {
        localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
        console.error('Failed to save image store to localStorage', e);
    }
};

// Add a new image and return its reference ID
export const addImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            // Create a unique ID for the image reference
            const imageId = `image-ref://${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

            const store = getImageStore();
            store[imageId] = dataUrl;
            saveImageStore(store);

            resolve(imageId);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

// Replace image references in markdown with their full Base64 data URLs
export const resolveMarkdownImages = (markdown: string): string => {
    const store = getImageStore();
    if (Object.keys(store).length === 0) {
        return markdown;
    }

    // Use a regex to find all markdown image tags with our custom 'image-ref://' protocol
    const resolvedMarkdown = markdown.replace(
        /!\[(.*?)\]\((image-ref:\/\/[^)]+)\)/g,
        (match, altText, imageId) => {
            const dataUrl = store[imageId];
            if (dataUrl) {
                // If found in the store, replace the reference with the actual data URL
                return `![${altText}](${dataUrl})`;
            }
            // If for some reason the image is not in the store, leave the original reference to avoid breaking the text
            return match;
        },
    );

    return resolvedMarkdown;
};
