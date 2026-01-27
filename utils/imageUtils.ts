/**
 * Image URL utilities with fallback support
 * Primary: Local IP server (10.177.237.139:8000)
 * Fallback: Production server (90skalyanam.com)
 * 
 * Images are stored in:
 * - Profile: /assets/images/user/profile/
 * - Gallery: /assets/images/user/gallery/
 */

export interface ImageUrls {
  primary: string | null;
  fallback: string | null;
}

/**
 * Construct profile image URL with fallback
 * @param image - Image filename or full URL
 * @returns Object with primary and fallback URLs
 */
export const getImageUrl = (image: string | null | undefined): ImageUrls => {
  if (!image || typeof image !== 'string' || image.trim() === '') {
    return { primary: null, fallback: null };
  }
  
  const trimmedImage = image.trim();
  // If it's already a full URL (from API), normalise production paths
  if (trimmedImage.startsWith('http')) {
    // If it's a local IP URL, convert to production URL
    if (trimmedImage.includes('10.177.237.139') || trimmedImage.includes('localhost')) {
      // Extract filename from URL
      const filename = trimmedImage.split('/').pop();
      const productionUrl = `https://app.90skalyanam.com/assets/images/user/profile/${filename}`;
      console.log('🔄 Converting local IP URL to production:', { local: trimmedImage, production: productionUrl });
      return { primary: productionUrl, fallback: null };
    }
    // Fix: some API URLs miss the /profile/ segment (e.g. .../user/profile_xxx.jpg)
    if(trimmedImage.includes('/assets/images/user/') && !trimmedImage.includes('/assets/images/user/profile/')){
      const fixed = trimmedImage.replace('/assets/images/user/','/assets/images/user/profile/');
      console.log('🔄 Fixed malformed profile URL', trimmedImage,'→',fixed);
      return { primary: fixed, fallback: null };
    }
    // If it's already a production URL, use it directly
    return { primary: trimmedImage, fallback: null };
  }
  
  // If it's just a filename, construct URL with production server
  const primaryUrl = `https://app.90skalyanam.com/assets/images/user/profile/${trimmedImage}`;
  // Fallback to environment variable (local IP)
  const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_PROFILE_BASE_URL || 'http://10.177.237.139:8000/Final%20Code/assets/assets/images/user/profile';
  const fallbackUrl = `${imageBaseUrl}/${trimmedImage}`;
  
  return { primary: primaryUrl, fallback: fallbackUrl };
};

/**
 * Construct gallery image URL with fallback
 * @param image - Image filename or full URL
 * @returns Object with primary and fallback URLs
 */
export const getGalleryImageUrl = (image: string | null | undefined): ImageUrls => {
  if (!image || typeof image !== 'string' || image.trim() === '') {
    return { primary: null, fallback: null };
  }
  
  const trimmedImage = image.trim();
  const devBase = process.env.EXPO_PUBLIC_IMAGE_GALLERY_BASE_URL || 'http://10.169.108.139/app_matri/matri_app/assets/images/user/gallery';
  // If API already returns full URL, still prefer our dev server by filename
  if (trimmedImage.startsWith('http')) {
    const filename = trimmedImage.split('/').pop();
    // ensure production url contains /core/public/ segment
    let fixedProd = trimmedImage;
    if(fixedProd.includes('app.90skalyanam.com') && !fixedProd.includes('/core/public/')){
      fixedProd = fixedProd.replace('app.90skalyanam.com','app.90skalyanam.com/core/public');
    }
    const legacyUrl = trimmedImage;
    return { primary: fixedProd, fallback: legacyUrl };
  }
  
  // If it's just a filename, construct URL with LOCAL first
  const webBase = process.env.EXPO_PUBLIC_WEB_BASE_URL || 'http://10.169.108.139/app_matri/matri_app';
  const imageBaseUrl = process.env.EXPO_PUBLIC_IMAGE_GALLERY_BASE_URL || `${webBase}/assets/images/user/gallery`;
  const primaryUrl = `${imageBaseUrl}/${trimmedImage}`;
  // Production fallback
  const fallbackUrl = `https://app.90skalyanam.com/assets/images/user/gallery/${trimmedImage}`;
  return { primary: primaryUrl, fallback: fallbackUrl };
};

/**
 * Get primary image URL only (for simple cases)
 * @param image - Image filename or full URL
 * @returns Primary image URL or null
 */
export const getPrimaryImageUrl = (image: string | null | undefined): string | null => {
  const urls = getImageUrl(image);
  return urls.primary;
};

/**
 * Get primary gallery image URL only (for simple cases)
 * @param image - Image filename or full URL
 * @returns Primary gallery image URL or null
 */
export const getPrimaryGalleryImageUrl = (image: string | null | undefined): string | null => {
  const urls = getGalleryImageUrl(image);
  return urls.primary;
};
