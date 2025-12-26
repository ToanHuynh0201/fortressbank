import { useMemo } from "react";
import {
	useCameraDevice,
	useCameraFormat,
	type CameraDevice,
	type CameraDeviceFormat,
} from "react-native-vision-camera";

export interface UseCameraDeviceResult {
	device: CameraDevice | undefined;
	format: CameraDeviceFormat | undefined;
}

/**
 * Hook to get front camera device with optimal format for face detection
 * Returns front camera configured for 720p @ 30fps
 */
export function useFrontCameraDevice(): UseCameraDeviceResult {
	// Get front camera device
	const device = useCameraDevice("front", {
		physicalDevices: ["ultra-wide-angle-camera", "wide-angle-camera"],
	});

	// Get optimal format for face detection
	// 720p is sufficient for face detection and better for performance
	const format = useCameraFormat(device, [
		{ videoResolution: { width: 1280, height: 720 } },
		{ fps: 30 },
	]);

	return useMemo(
		() => ({
			device,
			format,
		}),
		[device, format],
	);
}
