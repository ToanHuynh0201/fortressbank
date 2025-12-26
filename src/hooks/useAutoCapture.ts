import { useState, useRef, useCallback, useEffect } from "react";

export type CaptureState =
	| "idle" // Waiting for valid face
	| "detecting" // Face detected, validating
	| "valid" // All conditions met, waiting for stability
	| "counting" // Countdown before capture
	| "capturing" // Taking photo
	| "cooldown"; // Post-capture delay

export interface AutoCaptureConfig {
	stabilityFrames?: number; // Number of consecutive valid frames required
	countdownDuration?: number; // Countdown duration in ms
	cooldownDuration?: number; // Cooldown duration in ms
	enabled?: boolean; // Enable/disable auto-capture
}

const DEFAULT_CONFIG: Required<AutoCaptureConfig> = {
	stabilityFrames: 15, // 15 frames @ 30fps = ~0.5s
	countdownDuration: 1000, // 1 second
	cooldownDuration: 500, // 0.5 second
	enabled: true,
};

export interface UseAutoCaptureResult {
	state: CaptureState;
	countdown: number;
	isCapturing: boolean;
	onValidationResult: (isValid: boolean) => void;
	triggerCapture: () => Promise<void>;
	reset: () => void;
	enable: () => void;
	disable: () => void;
}

/**
 * Hook for managing auto-capture state machine
 * Tracks validation results and triggers capture when conditions are met
 */
export function useAutoCapture(
	onCapture: () => Promise<void>,
	config: AutoCaptureConfig = {},
): UseAutoCaptureResult {
	const fullConfig = { ...DEFAULT_CONFIG, ...config };

	const [state, setState] = useState<CaptureState>("idle");
	const [countdown, setCountdown] = useState(0);
	const [enabled, setEnabled] = useState(fullConfig.enabled);

	const consecutiveValidFrames = useRef(0);
	const countdownTimer = useRef<NodeJS.Timeout | null>(null);
	const cooldownTimer = useRef<NodeJS.Timeout | null>(null);
	const countdownInterval = useRef<NodeJS.Timeout | null>(null);

	/**
	 * Clean up all timers
	 */
	const clearTimers = useCallback(() => {
		if (countdownTimer.current) {
			clearTimeout(countdownTimer.current);
			countdownTimer.current = null;
		}
		if (cooldownTimer.current) {
			clearTimeout(cooldownTimer.current);
			cooldownTimer.current = null;
		}
		if (countdownInterval.current) {
			clearInterval(countdownInterval.current);
			countdownInterval.current = null;
		}
	}, []);

	/**
	 * Reset state machine
	 */
	const reset = useCallback(() => {
		clearTimers();
		consecutiveValidFrames.current = 0;
		setState("idle");
		setCountdown(0);
	}, [clearTimers]);

	/**
	 * Start countdown before capture
	 */
	const startCountdown = useCallback(() => {
		setState("counting");
		const countdownSteps = Math.ceil(fullConfig.countdownDuration / 100);
		let currentStep = countdownSteps;
		setCountdown(currentStep);

		// Update countdown display every 100ms
		countdownInterval.current = setInterval(() => {
			currentStep--;
			setCountdown(currentStep);
		}, 100);

		// Trigger capture after countdown
		countdownTimer.current = setTimeout(async () => {
			if (countdownInterval.current) {
				clearInterval(countdownInterval.current);
				countdownInterval.current = null;
			}
			setCountdown(0);
			setState("capturing");

			try {
				await onCapture();
			} catch (error) {
				console.error("Capture error:", error);
				reset();
				return;
			}

			// Start cooldown
			setState("cooldown");
			cooldownTimer.current = setTimeout(() => {
				reset();
			}, fullConfig.cooldownDuration);
		}, fullConfig.countdownDuration);
	}, [fullConfig, onCapture, reset]);

	/**
	 * Handle validation result from frame processor
	 */
	const onValidationResult = useCallback(
		(isValid: boolean) => {
			// Ignore if auto-capture is disabled or currently capturing
			if (
				!enabled ||
				state === "capturing" ||
				state === "counting" ||
				state === "cooldown"
			) {
				return;
			}

			if (isValid) {
				consecutiveValidFrames.current++;
				setState("detecting");

				// Check if we have enough consecutive valid frames
				if (
					consecutiveValidFrames.current >= fullConfig.stabilityFrames
				) {
					setState("valid");
					startCountdown();
				}
			} else {
				// Reset counter if validation fails
				consecutiveValidFrames.current = 0;
				setState("idle");
			}
		},
		[enabled, state, fullConfig.stabilityFrames, startCountdown],
	);

	/**
	 * Manually trigger capture (for fallback)
	 */
	const triggerCapture = useCallback(async () => {
		if (state === "capturing" || state === "counting") {
			return;
		}

		clearTimers();
		setState("capturing");

		try {
			await onCapture();
		} catch (error) {
			console.error("Manual capture error:", error);
			reset();
			return;
		}

		setState("cooldown");
		cooldownTimer.current = setTimeout(() => {
			reset();
		}, fullConfig.cooldownDuration);
	}, [state, onCapture, reset, clearTimers, fullConfig.cooldownDuration]);

	/**
	 * Enable auto-capture
	 */
	const enable = useCallback(() => {
		setEnabled(true);
	}, []);

	/**
	 * Disable auto-capture
	 */
	const disable = useCallback(() => {
		setEnabled(false);
		reset();
	}, [reset]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			clearTimers();
		};
	}, [clearTimers]);

	return {
		state,
		countdown,
		isCapturing: state === "capturing" || state === "cooldown",
		onValidationResult,
		triggerCapture,
		reset,
		enable,
		disable,
	};
}
