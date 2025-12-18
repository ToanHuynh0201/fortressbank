import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TouchableOpacity,
	RefreshControl,
	StatusBar,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
	FadeIn,
	FadeInDown,
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	withSpring,
	Easing,
} from "react-native-reanimated";
import { Plus, CaretLeft } from "phosphor-react-native";
import { BeneficiaryCard } from "@/components/beneficiaries";
import { Beneficiary } from "@/types/beneficiary";
import beneficiaryService from "@/services/beneficiaryService";
import colors from "@/constants/colors";
import { AlertModal, ConfirmationModal, LoadingState } from "@/components/common";

const Beneficiaries = () => {
	const router = useRouter();
	const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [alertModal, setAlertModal] = useState({ visible: false, title: "", message: "", variant: "info" as "success" | "error" | "info" });
	const [deleteModal, setDeleteModal] = useState({ visible: false, beneficiary: null as Beneficiary | null });

	// Animation values
	const headerOpacity = useSharedValue(0);
	const contentOpacity = useSharedValue(0);
	const contentTranslateY = useSharedValue(15);
	const fabScale = useSharedValue(0);

	useEffect(() => {
		// Header animation
		headerOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});

		// Content animation
		contentOpacity.value = withTiming(1, {
			duration: 400,
			easing: Easing.out(Easing.ease),
		});
		contentTranslateY.value = withSpring(0, {
			damping: 20,
			stiffness: 90,
		});

		// FAB animation with delay
		setTimeout(() => {
			fabScale.value = withSpring(1, {
				damping: 15,
				stiffness: 100,
			});
		}, 300);
	}, []);

	const headerAnimatedStyle = useAnimatedStyle(() => ({
		opacity: headerOpacity.value,
	}));

	const contentAnimatedStyle = useAnimatedStyle(() => ({
		opacity: contentOpacity.value,
		transform: [{ translateY: contentTranslateY.value }],
	}));

	const fabAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: fabScale.value }],
	}));

	// Load beneficiaries on mount and when screen is focused
	useFocusEffect(
		useCallback(() => {
			loadBeneficiaries();
		}, []),
	);

	const loadBeneficiaries = async () => {
		setIsLoading(true);
		try {
			const data = await beneficiaryService.getBeneficiaries();
			setBeneficiaries(data);
		} catch (error) {
			console.error("Error loading beneficiaries:", error);
			setAlertModal({ visible: true, title: "Error", message: "Failed to load beneficiaries", variant: "error" });
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
			params: {
				beneficiaryId: beneficiary.id,
				accountNumber: beneficiary.accountNumber,
				accountName: beneficiary.accountName,
				bankName: beneficiary.bankName,
				nickName: beneficiary.nickName,
			},
		});
	};

	const handleDelete = (beneficiary: Beneficiary) => {
		setDeleteModal({ visible: true, beneficiary });
	};

	const handleDeleteConfirm = async () => {
		const beneficiary = deleteModal.beneficiary;
		if (!beneficiary) return;

		setDeleteModal({ visible: false, beneficiary: null });
		setDeletingId(beneficiary.id);
		try {
			await beneficiaryService.deleteBeneficiary(beneficiary.id);
			await loadBeneficiaries();
			setAlertModal({ visible: true, title: "Success", message: "Beneficiary deleted successfully", variant: "success" });
		} catch (error) {
			console.error("Error deleting beneficiary:", error);
			setAlertModal({ visible: true, title: "Error", message: "Failed to delete beneficiary", variant: "error" });
		} finally {
			setDeletingId(null);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteModal({ visible: false, beneficiary: null });
	};

	const renderEmpty = () => (
		<Animated.View
			entering={FadeInDown.delay(200).duration(500)}
			style={styles.emptyContainer}>
			<View style={styles.emptyIconContainer}>
				<Text style={styles.emptyIcon}>👥</Text>
			</View>
			<Text style={styles.emptyTitle}>No Saved Beneficiaries</Text>
			<Text style={styles.emptySubtitle}>
				Add beneficiaries for quick and easy transfers to your favorite
				contacts
			</Text>
			<TouchableOpacity
				style={styles.emptyButton}
				onPress={handleAdd}
				activeOpacity={0.8}>
				<Plus
					size={22}
					color={colors.neutral.neutral6}
					weight="bold"
				/>
				<Text style={styles.emptyButtonText}>
					Add Your First Beneficiary
				</Text>
			</TouchableOpacity>
		</Animated.View>
	);

	return (
		<SafeAreaView
			style={styles.container}
			edges={["top"]}>
			<StatusBar
				barStyle="light-content"
				backgroundColor={colors.primary.primary1}
			/>

			{/* Enhanced Navigation Header */}
			<Animated.View style={[styles.header, headerAnimatedStyle]}>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}>
					<View style={styles.backButtonCircle}>
						<CaretLeft
							size={20}
							color={colors.neutral.neutral6}
							weight="bold"
						/>
					</View>
				</TouchableOpacity>
				<View style={styles.headerTitleContainer}>
					<Text style={styles.headerTitle}>Beneficiaries</Text>
					<Text style={styles.headerSubtitle}>
						Manage your saved recipients
					</Text>
				</View>
			</Animated.View>

			<Animated.View style={[styles.content, contentAnimatedStyle]}>
				{isLoading && !refreshing ? (
					<LoadingState message="Loading beneficiaries..." />
				) : !isLoading && beneficiaries.length === 0 ? (
					renderEmpty()
				) : (
					<FlatList
						data={beneficiaries}
						keyExtractor={(item) => item.id.toString()}
						renderItem={({ item, index }) => (
							<Animated.View
								entering={FadeInDown.delay(index * 50).duration(
									500,
								)}>
								<BeneficiaryCard
									beneficiary={item}
									onEdit={() => handleEdit(item)}
									onDelete={() => handleDelete(item)}
									showActions={true}
									isDeleting={deletingId === item.id}
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

				{/* Enhanced Floating Add Button */}
				{beneficiaries.length > 0 && (
					<Animated.View
						style={[styles.fabContainer, fabAnimatedStyle]}>
						<TouchableOpacity
							style={styles.fab}
							onPress={handleAdd}
							activeOpacity={0.8}>
							<Plus
								size={26}
								color={colors.neutral.neutral6}
								weight="bold"
							/>
						</TouchableOpacity>
					</Animated.View>
				)}
			</Animated.View>

			<AlertModal
				visible={alertModal.visible}
				title={alertModal.title}
				message={alertModal.message}
				variant={alertModal.variant}
				onClose={() => setAlertModal({ ...alertModal, visible: false })}
			/>

			<ConfirmationModal
				visible={deleteModal.visible}
				title="Delete Beneficiary"
				message={`Are you sure you want to delete ${deleteModal.beneficiary?.nickName || deleteModal.beneficiary?.accountName}?`}
				confirmText="Delete"
				cancelText="Cancel"
				onConfirm={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
				confirmButtonVariant="danger"
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.primary.primary1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingTop: 16,
		paddingBottom: 20,
		backgroundColor: colors.primary.primary1,
	},
	backButton: {
		marginRight: 16,
	},
	backButtonCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1.5,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	headerTitleContainer: {
		flex: 1,
	},
	headerTitle: {
		fontFamily: "Poppins",
		fontSize: 22,
		fontWeight: "700",
		lineHeight: 28,
		color: colors.neutral.neutral6,
		marginBottom: 2,
	},
	headerSubtitle: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "400",
		color: "rgba(255, 255, 255, 0.8)",
		lineHeight: 18,
	},
	content: {
		flex: 1,
		backgroundColor: colors.neutral.neutral6,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		marginTop: -10,
	},
	listContent: {
		padding: 20,
		paddingTop: 24,
		paddingBottom: 100,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	emptyIconContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 24,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 5,
	},
	emptyIcon: {
		fontSize: 48,
	},
	emptyTitle: {
		fontFamily: "Poppins",
		fontSize: 20,
		fontWeight: "700",
		color: colors.neutral.neutral1,
		marginBottom: 10,
		textAlign: "center",
	},
	emptySubtitle: {
		fontFamily: "Poppins",
		fontSize: 14,
		fontWeight: "400",
		color: colors.neutral.neutral3,
		textAlign: "center",
		marginBottom: 36,
		lineHeight: 20,
	},
	emptyButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		backgroundColor: colors.primary.primary1,
		paddingVertical: 16,
		paddingHorizontal: 28,
		borderRadius: 16,
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 6,
	},
	emptyButtonText: {
		fontFamily: "Poppins",
		fontSize: 16,
		fontWeight: "600",
		color: colors.neutral.neutral6,
	},
	fabContainer: {
		position: "absolute",
		right: 20,
		bottom: 20,
	},
	fab: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: colors.primary.primary1,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: colors.primary.primary1,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.4,
		shadowRadius: 12,
		elevation: 10,
		borderWidth: 2,
		borderColor: "rgba(255, 255, 255, 0.2)",
	},
});

export default Beneficiaries;
