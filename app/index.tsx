import {StatusBar} from "expo-status-bar";
import {StyleSheet, Text, View, Pressable} from "react-native";
import {Link, useRouter} from "expo-router";

const Home = () => {
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
            </View>
            
            <StatusBar style="auto" />
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 300,
        gap: 12,
    },
    button: {
        backgroundColor: "#3629B7",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#3629B7',
    },
    buttonSecondary: {
        backgroundColor: '#5655B9',
        marginTop: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    buttonTextOutline: {
        color: '#3629B7',
    },
});

