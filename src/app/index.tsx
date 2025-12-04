import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { primary, neutral } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
	withDelay,
	withSpring,
	interpolate,
	Extrapolate,
} from "react-native-reanimated";
import { useEffect, useState } from "react";

// Animated Letter Component - Hiển thị từng chữ cái
const AnimatedLetter = ({
	letter,
	index,
}: {
	letter: string;
	index: number;
}) => {
	const opacity = useSharedValue(0);
	const translateY = useSharedValue(20);
	const scale = useSharedValue(0.5);

	useEffect(() => {
		const delay = index * 80; // Mỗi chữ cái xuất hiện cách nhau 80ms

		opacity.value = withDelay(delay, withSpring(1, { damping: 10 }));
		translateY.value = withDelay(
			delay,
			withSpring(0, { damping: 12, stiffness: 100 }),
		);
		scale.value = withDelay(delay, withSpring(1, { damping: 8 }));
	}, []);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ translateY: translateY.value }, { scale: scale.value }],
	}));

	return (
		<Animated.Text style={[styles.letter, animatedStyle]}>
			{letter}
		</Animated.Text>
	);
};

// Typing Effect Component - Hiệu ứng đánh máy
const TypingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
	const [displayedText, setDisplayedText] = useState("");

	useEffect(() => {
		const timeout = setTimeout(() => {
			let currentIndex = 0;
			const interval = setInterval(() => {
				if (currentIndex <= text.length) {
					setDisplayedText(text.slice(0, currentIndex));
					currentIndex++;
				} else {
					clearInterval(interval);
				}
			}, 50); // Tốc độ đánh máy

			return () => clearInterval(interval);
		}, delay);

		return () => clearTimeout(timeout);
	}, [text, delay]);

	return (
		<Text style={styles.slogan}>
			{displayedText}
			<Text style={styles.cursor}>|</Text>
		</Text>
	);
};

// Floating Particle Component
const FloatingParticle = ({
	index,
	initialLeft,
	initialTop,
	size,
}: {
	index: number;
	initialLeft: string;
	initialTop: string;
	size: number;
}) => {
	const translateY = useSharedValue(0);
	const translateX = useSharedValue(0);
	const opacity = useSharedValue(0.3);

	useEffect(() => {
		const randomDuration = 3000 + Math.random() * 2000;
		const randomDelay = Math.random() * 1000;

		translateY.value = withDelay(
			randomDelay,
			withRepeat(
				withSequence(
					withTiming(-30, { duration: randomDuration }),
					withTiming(0, { duration: randomDuration }),
				),
				-1,
				true,
			),
		);

		translateX.value = withDelay(
			randomDelay,
			withRepeat(
				withSequence(
					withTiming(20, { duration: randomDuration }),
					withTiming(-20, { duration: randomDuration }),
				),
				-1,
				true,
			),
		);

		opacity.value = withRepeat(
			withSequence(
				withTiming(0.6, { duration: randomDuration }),
				withTiming(0.2, { duration: randomDuration }),
			),
			-1,
			true,
		);
	}, []);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [
			{ translateY: translateY.value },
			{ translateX: translateX.value },
		],
	}));

	return (
		<Animated.View
			style={[
				styles.particle,
				animatedStyle,
				{
					width: size,
					height: size,
					left: initialLeft as any,
					top: initialTop as any,
				},
			]}
		/>
	);
};

const index = () => {
	const router = useRouter();
	const logoScale = useSharedValue(0);
	const logoRotate = useSharedValue(0);
	const shimmer = useSharedValue(0);
	const containerOpacity = useSharedValue(1);

	const bankName = "FortressBank";

	// Tạo particles với random positions
	const particlesData = Array.from({ length: 20 }, (_, i) => ({
		key: i,
		size: 4 + Math.random() * 6,
		left: `${Math.random() * 100}%`,
		top: `${Math.random() * 100}%`,
	}));

	useEffect(() => {
		// Animation logo xuất hiện
		logoScale.value = withSpring(1, { damping: 10, stiffness: 100 });
		logoRotate.value = withSequence(
			withTiming(360, { duration: 1000 }),
			withTiming(0, { duration: 0 }),
		);

		// Shimmer effect
		shimmer.value = withRepeat(
			withSequence(
				withTiming(1, { duration: 2000 }),
				withTiming(0, { duration: 0 }),
			),
			-1,
			false,
		);

		// Chuyển trang sau 3.5 giây với fade out mượt
		const navigationTimer = setTimeout(() => {
			containerOpacity.value = withTiming(0, { duration: 500 });

			// Chuyển trang ngay khi bắt đầu fade out để tránh màn hình trắng
			setTimeout(() => {
				router.replace("(auth)/signIn");
			}, 300);
		}, 4000);

		return () => clearTimeout(navigationTimer);
	}, []);

	const animatedLogoStyle = useAnimatedStyle(() => ({
		transform: [
			{ scale: logoScale.value },
			{ rotate: `${logoRotate.value}deg` },
		],
	}));

	const animatedShimmerStyle = useAnimatedStyle(() => {
		const translateX = interpolate(
			shimmer.value,
			[0, 1],
			[-300, 300],
			Extrapolate.CLAMP,
		);

		return {
			transform: [{ translateX }],
		};
	});

	const animatedContainerStyle = useAnimatedStyle(() => ({
		opacity: containerOpacity.value,
	}));

	return (
		<LinearGradient
			colors={[primary.primary1, primary.primary2, primary.primary3]}
			style={styles.gradient}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}>
			{/* Floating Particles Background */}
			<View style={styles.particlesContainer}>
				{particlesData.map((particle) => (
					<FloatingParticle
						key={particle.key}
						index={particle.key}
						initialLeft={particle.left}
						initialTop={particle.top}
						size={particle.size}
					/>
				))}
			</View>

			<Animated.View style={[styles.container, animatedContainerStyle]}>
				{/* Logo với shimmer effect */}
				<View style={styles.logoContainer}>
					<Animated.Text style={[styles.logoIcon, animatedLogoStyle]}>
						🏰
					</Animated.Text>

					<View style={styles.shimmerContainer}>
						<Animated.View
							style={[styles.shimmer, animatedShimmerStyle]}
						/>

						{/* Animated Title - Từng chữ cái */}
						<View style={styles.titleContainer}>
							{bankName.split("").map((letter, index) => (
								<AnimatedLetter
									key={index}
									letter={letter}
									index={index}
								/>
							))}
						</View>
					</View>

					{/* Underline với animation */}
					<Animated.View
						entering={FadeIn.duration(800).delay(1000)}
						style={styles.underline}
					/>
				</View>

				{/* Slogan với typing effect */}
				<Animated.View
					entering={FadeInUp.duration(600).delay(1200)}
					style={styles.sloganContainer}>
					<TypingText
						text="Your Fortress of Financial Security"
						delay={1400}
					/>
				</Animated.View>

				{/* Decorative elements */}
				<Animated.View
					entering={FadeIn.duration(1000).delay(1800)}
					style={styles.decorativeContainer}>
					<View style={styles.decorativeLine} />
					<Text style={styles.decorativeText}>
						SECURE • TRUSTED • MODERN
					</Text>
					<View style={styles.decorativeLine} />
				</Animated.View>

				<StatusBar style="light" />
			</Animated.View>
		</LinearGradient>
	);
};

export default index;

const styles = StyleSheet.create({
	gradient: {
		flex: 1,
	},
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	particlesContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		overflow: "hidden",
	},
	particle: {
		position: "absolute",
		backgroundColor: neutral.neutral6,
		borderRadius: 10,
		opacity: 0.3,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 30,
		position: "relative",
	},
	logoIcon: {
		fontSize: 100,
		marginBottom: 20,
		textShadowColor: "rgba(0, 0, 0, 0.3)",
		textShadowOffset: { width: 0, height: 4 },
		textShadowRadius: 8,
	},
	shimmerContainer: {
		position: "relative",
		overflow: "hidden",
	},
	shimmer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		width: 100,
		transform: [{ skewX: "-20deg" }],
	},
	titleContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	letter: {
		fontSize: 42,
		fontWeight: "800",
		color: neutral.neutral6,
		letterSpacing: 1,
		textShadowColor: "rgba(0, 0, 0, 0.3)",
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 4,
	},
	title: {
		fontSize: 42,
		fontWeight: "800",
		color: neutral.neutral6,
		letterSpacing: 1,
		textShadowColor: "rgba(0, 0, 0, 0.3)",
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 4,
	},
	underline: {
		width: 80,
		height: 4,
		backgroundColor: neutral.neutral6,
		borderRadius: 2,
		marginTop: 12,
		shadowColor: neutral.neutral6,
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 4,
	},
	sloganContainer: {
		marginBottom: 40,
		paddingHorizontal: 30,
	},
	slogan: {
		fontSize: 17,
		color: neutral.neutral6,
		textAlign: "center",
		fontWeight: "500",
		opacity: 0.95,
		fontStyle: "italic",
		letterSpacing: 0.5,
		lineHeight: 24,
	},
	cursor: {
		opacity: 0.7,
		fontSize: 17,
	},
	decorativeContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 20,
		paddingHorizontal: 40,
	},
	decorativeLine: {
		width: 40,
		height: 1,
		backgroundColor: neutral.neutral6,
		opacity: 0.5,
	},
	decorativeText: {
		fontSize: 11,
		fontWeight: "600",
		color: neutral.neutral6,
		letterSpacing: 2,
		opacity: 0.7,
		marginHorizontal: 15,
	},
});
