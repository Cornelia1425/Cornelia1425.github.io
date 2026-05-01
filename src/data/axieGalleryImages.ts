/**
 * Axie gallery — files live in public/images/1_axiegallery/
 * Add a filename here when you add a new asset to that folder.
 */
export const AXIE_GALLERY_IMAGES = [
  '1_handdrawing.jpg',
  '2_handdrawing.jpg',
  '3_handdrawing.jpg',
  '4_axie.jpg',
  '5_axie.jpg',
  '6_axie.jpg',
  '7_axie.jpg',
  '8_axie.jpg',
] as const;

export type AxieGalleryFilename = (typeof AXIE_GALLERY_IMAGES)[number];
