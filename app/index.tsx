import {StatusBar} from "expo-status-bar";
import {StyleSheet, Text, View, Pressable} from "react-native";
import {Link} from "expo-router";

export default function Home() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to FortressBank!</Text>
            <Text style={styles.subtitle}>Built with Expo Router</Text>
            
            <Link href="/api-demo" asChild>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Test API Service →</Text>
                </Pressable>
            </Link>
            
            <StatusBar style="auto" />
        </View>
    );
}

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
    button: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});

