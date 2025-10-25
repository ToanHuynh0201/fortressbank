import {StatusBar} from "expo-status-bar";
import {StyleSheet, Text, View, Pressable} from "react-native";
import {Link, useRouter} from "expo-router";
import { primary, neutral } from '../src/constants/colors';

const index = () => {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to FortressBank!</Text>
            <Text style={styles.subtitle}>Built with Expo Router</Text>
            
            <View style={styles.buttonContainer}>
                <Pressable style={styles.button} onPress={() => router.push("(auth)/signIn")}>
                        <Text style={styles.buttonText}>Sign In</Text>
                    </Pressable>
                
                <Pressable style={[styles.button, styles.buttonOutline]} onPress={() => router.push("(auth)/signUp")}>
                        <Text style={[styles.buttonText, styles.buttonTextOutline]}>Sign Up</Text>
                    </Pressable>

                <Pressable style={[styles.button, styles.buttonSecondary]} onPress={() => router.push("(auth)/forgotPassword")}>
                        <Text style={styles.buttonText}>Forgot Password</Text>
                    </Pressable>

                <Pressable style={[styles.button, styles.buttonSecondary]} onPress={() => router.push("(auth)/changePassword")}>
                        <Text style={styles.buttonText}>Change Password</Text>
                    </Pressable>
            </View>
            
            <StatusBar style="auto" />
        </View>
    );
};

export default index;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: neutral.neutral6,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: neutral.neutral1,
    },
    subtitle: {
        fontSize: 16,
        color: neutral.neutral2,
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 300,
        gap: 12,
    },
    button: {
        backgroundColor: primary.primary1,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: primary.primary1,
    },
    buttonSecondary: {
        backgroundColor: primary.primary2,
        marginTop: 8,
    },
    buttonText: {
        color: neutral.neutral6,
        fontSize: 16,
        fontWeight: "600",
    },
    buttonTextOutline: {
        color: primary.primary1,
    },
});

