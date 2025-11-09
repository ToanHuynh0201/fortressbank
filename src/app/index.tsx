import {StatusBar} from "expo-status-bar";
import {StyleSheet, Text, View, Pressable} from "react-native";
import {useRouter} from "expo-router";
import { primary, neutral } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
    FadeInDown, 
    FadeInUp,
    FadeOut,
    useAnimatedStyle, 
    useSharedValue, 
    withRepeat, 
    withSequence, 
    withTiming,
    withSpring,
    runOnJS
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const index = () => {
    const router = useRouter();
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const [shouldNavigate, setShouldNavigate] = useState(false);

    useEffect(() => {
        // Animation cho logo
        scale.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 2000 }),
                withTiming(1, { duration: 2000 })
            ),
            -1,
            true
        );

        // Bắt đầu fade out sau 1.5 giây, sau đó chuyển trang
        const fadeTimer = setTimeout(() => {
            opacity.value = withTiming(0, { duration: 500 }, (finished) => {
                if (finished) {
                    runOnJS(setShouldNavigate)(true);
                }
            });
        }, 1500);

        return () => clearTimeout(fadeTimer);
    }, []);

    useEffect(() => {
        if (shouldNavigate) {
            router.replace("(auth)/signIn");
        }
    }, [shouldNavigate]);

    const animatedLogoStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    return (
        <LinearGradient
            colors={[primary.primary1, primary.primary2, primary.primary3]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <Animated.View style={[styles.container, animatedContainerStyle]}>
                <Animated.View entering={FadeInDown.duration(1000).springify()}>
                    <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
                        <Text style={styles.logoIcon}>🏰</Text>
                        <Text style={styles.title}>FortressBank</Text>
                        <View style={styles.underline} />
                    </Animated.View>
                </Animated.View>

                <Animated.View entering={FadeInUp.duration(1000).delay(300)}>
                    <Text style={styles.slogan}>
                        Your Fortress of Financial Security
                    </Text>
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
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoIcon: {
        fontSize: 80,
        marginBottom: 10,
    },
    title: {
        fontSize: 42,
        fontWeight: "800",
        color: neutral.neutral6,
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    underline: {
        width: 60,
        height: 4,
        backgroundColor: neutral.neutral6,
        borderRadius: 2,
        marginTop: 8,
    },
    slogan: {
        fontSize: 16,
        color: neutral.neutral6,
        marginBottom: 60,
        textAlign: 'center',
        fontWeight: '500',
        opacity: 0.95,
        fontStyle: 'italic',
        paddingHorizontal: 40,
    },
});

