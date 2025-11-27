import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	Alert,
	RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { Plus } from "phosphor-react-native";
import { AppHeader } from "@/components/common";
import { BeneficiaryCard } from "@/components/beneficiaries";
import { Beneficiary } from "@/types/beneficiary";
import { getAllBeneficiaries, deleteBeneficiary } from "@/utils";
import colors from "@/constants/colors";

const Beneficiaries = () => {
	const router = useRouter();
	const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	// Load beneficiaries on mount and when screen is focused
	useFocusEffect(
		useCallback(() => {
			loadBeneficiaries();
		}, []),
	);

	const loadBeneficiaries = async () => {
		setIsLoading(true);
		try {
			const data = await getAllBeneficiaries();
			setBeneficiaries(data);
		} catch (error) {
			console.error("Error loading beneficiaries:", error);
			Alert.alert("Error", "Failed to load beneficiaries");
		} finally {
			setIsLoading(false);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await loadBeneficiaries();
		setRefreshing(false);
	};

	const handleAdd = () => {
		router.push("/addBeneficiary");
	};

	const handleEdit = (beneficiary: Beneficiary) => {
		router.push({
			pathname: "/addBeneficiary",
			params: { beneficiaryId: beneficiary.id },
		});
	};

	const handleDelete = (beneficiary: Beneficiary) => {
		Alert.alert(
			"Delete Beneficiary",
			`Are you sure you want to delete ${
				beneficiary.nickname || beneficiary.accountName
			}?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Delete",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteBeneficiary(beneficiary.id);
							await loadBeneficiaries();
						} catch (error) {
							console.error("Error deleting beneficiary:", error);
							Alert.alert(
								"Error",
								"Failed to delete beneficiary",
							);
						}
					},
				},
			],
		);
	};

	const renderEmpty = () => (
		<Animated.View
			entering={FadeIn.delay(100)}
			style={styles.emptyContainer}>
			<Text style={styles.emptyTitle}>No Saved Beneficiaries</Text>
			<Text style={styles.emptySubtitle}>
				Add beneficiaries for quick and easy transfers
			</Text>
			<TouchableOpacity
				style={styles.emptyButton}
				onPress={handleAdd}>
				<Plus
					size={20}
					color={colors.neutral.neutral6}
					weight="bold"
				/>
				<Text style={styles.emptyButtonText}>Add Beneficiary</Text>
			</TouchableOpacity>
		</Animated.View>
	);

	return (
		<SafeAreaView
			style={styles.container}
			edges={["top"]}>
			<AppHeader
				title="Beneficiaries"
				backgroundColor={colors.primary.primary1}
				textColor={colors.neutral.neutral6}
			/>

			<View style={styles.content}>
				{!isLoading && beneficiaries.length === 0 ? (
					renderEmpty()
				) : (
					<FlatList
						data={beneficiaries}
						keyExtractor={(item) => item.id}
						renderItem={({ item, index }) => (
							<Animated.View
								entering={FadeIn.delay(index * 50).duration(
									400,
								)}>
								<BeneficiaryCard
									beneficiary={item}
									onEdit={() => handleEdit(item)}
									onDelete={() => handleDelete(item)}
									showActions={true}
								/>
							</Animated.View>
						)}
						contentContainerStyle={styles.listContent}
						showsVerticalScrollIndicator={false}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={handleRefresh}
								tintColor={colors.primary.primary1}
							/>
						}
					/>
				)}

				{/* Floating Add Button */}
				{beneficiaries.length > 0 && (
					<TouchableOpacity
						style={styles.fab}
						onPress={handleAdd}>
						<Plus
							size={24}
							color={colors.neutral.neutral6}
							weight="bold"
						/>
					</TouchableOpacity>
				)}
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.primary.primary1,
	},
	content: {
		flex: 1,
		backgroundColor: colors.neutral.neutral6,
	},
	listContent: {
		padding: 20,
		paddingBottom: 100,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	emptyTitle: {
		fontFamily: "Poppins",
		fontSize: 18,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		marginBottom: 8,
		textAlign: "center",
	},
	emptySubtitle: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "400",
		color: colors.neutral.neutral3,
		textAlign: "center",
		marginBottom: 32,
	},
	emptyButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: colors.primary.primary1,
		paddingVertical: 14,
		paddingHorizontal: 24,
		borderRadius: 15,
	},
	emptyButtonText: {
		fontFamily: "Poppins",
		fontSize: 16,
		fontWeight: "600",
		color: colors.neutral.neutral6,
	},
	fab: {
		position: "absolute",
		right: 20,
		bottom: 20,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: colors.primary.primary1,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
});

export default Beneficiaries;
