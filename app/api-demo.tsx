import {
    View,
    Text,
    StyleSheet,
    Button,
    ActivityIndicator,
    ScrollView,
    Platform,
} from "react-native";
import {useState} from "react";
import testApiService from "@/lib/testApi";
import {getStorageItem, setStorageItem} from "@/utils/storage";

/**
 * Demo page để test API service với JSONPlaceholder
 * Public API: https://jsonplaceholder.typicode.com
 */
export default function ApiDemo() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string>("");

    // Test GET - Lấy danh sách users
    const testGetUsers = async () => {
        setLoading(true);
        setResult("");
        try {
            const response = await testApiService.get("/users");
            const users = response.data.slice(0, 3); // Lấy 3 users đầu
            setResult(
                `✅ GET /users (${response.data.length} users):\n\n${JSON.stringify(
                    users,
                    null,
                    2
                )}`
            );
        } catch (error: any) {
            setResult(`❌ Error: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    // Test GET - Lấy 1 user
    const testGetUser = async () => {
        setLoading(true);
        setResult("");
        try {
            const response = await testApiService.get("/users/1");
            setResult(
                `✅ GET /users/1:\n\n${JSON.stringify(response.data, null, 2)}`
            );
        } catch (error: any) {
            setResult(`❌ Error: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    // Test POST - Tạo mới post
    const testCreatePost = async () => {
        setLoading(true);
        setResult("");
        try {
            const newPost = {
                title: "FortressBank Test",
                body: "Testing API service from React Native!",
                userId: 1,
            };
            const response = await testApiService.post("/posts", newPost);
            setResult(
                `✅ POST /posts:\n\nRequest:\n${JSON.stringify(
                    newPost,
                    null,
                    2
                )}\n\nResponse:\n${JSON.stringify(response.data, null, 2)}`
            );
        } catch (error: any) {
            setResult(`❌ Error: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    // Test PUT - Update post
    const testUpdatePost = async () => {
        setLoading(true);
        setResult("");
        try {
            const updatedPost = {
                id: 1,
                title: "Updated Title",
                body: "Updated body from React Native",
                userId: 1,
            };
            const response = await testApiService.put("/posts/1", updatedPost);
            setResult(
                `✅ PUT /posts/1:\n\n${JSON.stringify(response.data, null, 2)}`
            );
        } catch (error: any) {
            setResult(`❌ Error: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    // Test DELETE
    const testDeletePost = async () => {
        setLoading(true);
        setResult("");
        try {
            const response = await testApiService.delete("/posts/1");
            setResult(
                `✅ DELETE /posts/1:\n\nStatus: ${
                    response.status
                }\nData: ${JSON.stringify(response.data, null, 2)}`
            );
        } catch (error: any) {
            setResult(`❌ Error: ${error.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    // Test Storage
    const testStorage = async () => {
        setLoading(true);
        setResult("");
        try {
            const testData = {
                name: "FortressBank",
                version: "1.0.0",
                timestamp: new Date().toISOString(),
            };

            // Set value
            await setStorageItem("test_key", testData);

            // Get value
            const value = await getStorageItem("test_key");

            setResult(
                `✅ AsyncStorage Test:\n\nSaved:\n${JSON.stringify(
                    testData,
                    null,
                    2
                )}\n\nRetrieved:\n${JSON.stringify(value, null, 2)}`
            );
        } catch (error: any) {
            setResult(`❌ Storage error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>🧪 API Service Test</Text>
            <Text style={styles.subtitle}>Using JSONPlaceholder API</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>GET Requests</Text>
                <View style={styles.buttonRow}>
                    <View style={styles.buttonWrapper}>
                        <Button
                            title="Get Users"
                            onPress={testGetUsers}
                            disabled={loading}
                        />
                    </View>
                    <View style={styles.buttonWrapper}>
                        <Button
                            title="Get User #1"
                            onPress={testGetUser}
                            disabled={loading}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>POST / PUT / DELETE</Text>
                <View style={styles.buttonContainer}>
                    <Button
                        title="POST - Create Post"
                        onPress={testCreatePost}
                        disabled={loading}
                        color="#28a745"
                    />
                    <View style={styles.spacer} />
                    <Button
                        title="PUT - Update Post"
                        onPress={testUpdatePost}
                        disabled={loading}
                        color="#ffc107"
                    />
                    <View style={styles.spacer} />
                    <Button
                        title="DELETE - Delete Post"
                        onPress={testDeletePost}
                        disabled={loading}
                        color="#dc3545"
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Storage Test</Text>
                <Button
                    title="Test AsyncStorage"
                    onPress={testStorage}
                    disabled={loading}
                    color="#6c757d"
                />
            </View>

            {loading && (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            )}

            {result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>📋 Result:</Text>
                    <ScrollView style={styles.resultScroll}>
                        <Text style={styles.resultText}>{result}</Text>
                    </ScrollView>
                </View>
            )}

            <View style={styles.footer} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 5,
        textAlign: "center",
        color: "#333",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 20,
    },
    section: {
        backgroundColor: "#fff",
        marginHorizontal: 15,
        marginBottom: 15,
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 12,
        color: "#495057",
    },
    buttonContainer: {
        gap: 10,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 10,
    },
    buttonWrapper: {
        flex: 1,
    },
    spacer: {
        height: 10,
    },
    loaderContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    loadingText: {
        marginTop: 10,
        color: "#666",
    },
    resultContainer: {
        marginHorizontal: 15,
        marginBottom: 20,
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#007bff",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        maxHeight: 400,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    resultScroll: {
        maxHeight: 350,
    },
    resultText: {
        fontSize: 12,
        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
        color: "#212529",
        lineHeight: 18,
    },
    footer: {
        height: 20,
    },
});
