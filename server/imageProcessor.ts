// Image Processing Service for Alga
// Auto-compression + watermark overlay for uploaded property/service images
import sharp from "sharp";
import path from "path";
import fs from "fs";

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  addWatermark?: boolean;
  watermarkOpacity?: number;
}

export class ImageProcessor {
  private watermarkPath: string;

  constructor() {
    // Watermark stored in attached_assets
    this.watermarkPath = path.join(
      process.cwd(),
      "attached_assets",
      "generated_images",
      "Alga_watermark_logo_eecbe277.png"
    );
  }

  /**
   * Process and compress an image with optional watermark
   * @param inputBuffer - Input image buffer
   * @param options - Processing options
   * @returns Compressed image buffer
   */
  async processImage(
    inputBuffer: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<Buffer> {
    const {
      maxWidth = 1280,
      maxHeight = 720,
      quality = 70,
      addWatermark = true,
      watermarkOpacity = 0.25,
    } = options;

    let image = sharp(inputBuffer);

    // 1. Resize to max dimensions (maintain aspect ratio)
    image = image.resize(maxWidth, maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });

    // 2. Add watermark if enabled and watermark file exists
    if (addWatermark && fs.existsSync(this.watermarkPath)) {
      try {
        // Get image metadata to calculate watermark size
        const metadata = await image.metadata();
        const imageWidth = metadata.width || 1280;
        
        // Watermark should be 15% of image width
        const watermarkWidth = Math.floor(imageWidth * 0.15);

        // Resize watermark
        const watermarkBuffer = await sharp(this.watermarkPath)
          .resize(watermarkWidth, null, { fit: "inside" })
          .toBuffer();

        // Apply watermark to bottom-right corner with opacity
        image = image.composite([
          {
            input: watermarkBuffer,
            gravity: "southeast",
            blend: "over",
          },
        ]);
      } catch (error) {
        console.error("Watermark application failed:", error);
        // Continue without watermark if it fails
      }
    }

    // 3. Compress as JPEG with quality setting
    const processedBuffer = await image
      .jpeg({
        quality,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer();

    return processedBuffer;
  }

  /**
   * Process multiple images in parallel
   */
  async processImages(
    imageBuffers: Buffer[],
    options?: ImageProcessingOptions
  ): Promise<Buffer[]> {
    return Promise.all(
      imageBuffers.map((buffer) => this.processImage(buffer, options))
    );
  }

  /**
   * Get compression stats
   */
  getCompressionStats(originalSize: number, compressedSize: number) {
    const reduction = ((originalSize - compressedSize) / originalSize) * 100;
    return {
      originalSize,
      compressedSize,
      reductionPercent: Math.round(reduction),
      savings: originalSize - compressedSize,
    };
  }
}

// Singleton instance
export const imageProcessor = new ImageProcessor();
