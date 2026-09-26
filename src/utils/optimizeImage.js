export const optimizeCloudinaryUrl = (url, width = 500) => {
    if (!url || !url.includes('cloudinary.com')) return url;

    // This injects auto-format (WebP/AVIF), auto-quality, and resizes to a sensible width
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};