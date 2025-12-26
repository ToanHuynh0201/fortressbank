import * as ImageManipulator from "expo-image-manipulator";
import { DetectedFace } from "./faceDetection";

export interface CropOptions {
	padding?: number; // Padding around face as percentage (0.0 - 1.0)
	targetSize?: number; // Target output size (square)
	quality?: number; // JPEG quality (0.0 - 1.0)
}

const DEFAULT_CROP_OPTIONS: CropOptions = {
	padding: 0.2, // 20% padding around face
	targetSize: 512, // 512x512 output
	quality: 0.8, // 80% JPEG quality
};

/**
 * Crop face from image with padding
 * @param imagePath - Path to the original image
 * @param faceBounds - Face bounds from detection
 * @param options - Cropping options
 * @returns URI of the cropped image
 */
export async function cropFaceFromImage(
	imagePath: string,
	faceBounds: DetectedFace["bounds"],
	options: CropOptions = DEFAULT_CROP_OPTIONS,
): Promise<string> {
	const { padding = 0.2, targetSize = 512, quality = 0.8 } = options;

	try {
		// Calculate padding in pixels
		const paddingX = faceBounds.width * padding;
		const paddingY = faceBounds.height * padding;

		// Calculate crop region with padding
		const cropX = Math.max(0, faceBounds.x - paddingX);
		const cropY = Math.max(0, faceBounds.y - paddingY);
		const cropWidth = faceBounds.width + paddingX * 2;
		const cropHeight = faceBounds.height + paddingY * 2;

		// Perform crop and resize
		const result = await ImageManipulator.manipulateAsync(
			imagePath,
			[
				{
					crop: {
						originX: cropX,
						originY: cropY,
						width: cropWidth,
						height: cropHeight,
					},
				},
				{
					resize: {
						width: targetSize,
						height: targetSize,
					},
				},
			],
			{
				compress: quality,
				format: ImageManipulator.SaveFormat.JPEG,
			},
		);

		return result.uri;
	} catch (error) {
		console.error("Face cropping error:", error);
		throw new Error("Failed to crop face from image");
	}
}

/**
 * Crop multiple faces from images
 * @param images - Array of { path, bounds } objects
 * @param options - Cropping options
 * @returns Array of cropped image URIs
 */
export async function cropMultipleFaces(
	images: Array<{ path: string; bounds: DetectedFace["bounds"] }>,
	options: CropOptions = DEFAULT_CROP_OPTIONS,
): Promise<string[]> {
	const cropPromises = images.map((img) =>
		cropFaceFromImage(img.path, img.bounds, options),
	);

	return Promise.all(cropPromises);
}
