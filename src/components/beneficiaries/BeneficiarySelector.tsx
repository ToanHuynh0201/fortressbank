import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	Modal,
	TouchableOpacity,
	FlatList,
	TextInput,
	ActivityIndicator,
} from "react-native";
import { MagnifyingGlass, X } from "phosphor-react-native";
import { Beneficiary } from "@/types/beneficiary";
import beneficiaryService from "@/services/beneficiaryService";
import colors from "@/constants/colors";
import { scale, fontSize, spacing } from "@/utils/responsive";
import BeneficiaryCard from "./BeneficiaryCard";

interface BeneficiarySelectorProps {
	visible: boolean;
	onClose: () => void;
	onSelect: (beneficiary: Beneficiary) => void;
}

/**
 * Modal component for selecting a beneficiary from saved list
 * Includes search functionality
 */
const BeneficiarySelector: React.FC<BeneficiarySelectorProps> = ({
	visible,
	onClose,
	onSelect,
}) => {
	const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
	const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<
		Beneficiary[]
	>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	// Load beneficiaries when modal opens
	useEffect(() => {
		if (visible) {
			loadBeneficiaries();
			setSearchQuery("");
		}
	}, [visible]);

	// Search beneficiaries when query changes
	useEffect(() => {
		if (searchQuery.trim()) {
			performSearch();
		} else {
			setFilteredBeneficiaries(beneficiaries);
		}
	}, [searchQuery, beneficiaries]);

	const loadBeneficiaries = async () => {
		setIsLoading(true);
		try {
			const data = await beneficiaryService.getBeneficiaries();
			setBeneficiaries(data);
			setFilteredBeneficiaries(data);
		} catch (error) {
			console.error("Error loading beneficiaries:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const performSearch = async () => {
		try {
			const results = await beneficiaryService.searchBeneficiaries(searchQuery);
			setFilteredBeneficiaries(results);
		} catch (error) {
			console.error("Error searching beneficiaries:", error);
		}
	};

	const handleSelect = (beneficiary: Beneficiary) => {
		onSelect(beneficiary);
		onClose();
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={true}
			onRequestClose={onClose}>
			<View style={styles.modalOverlay}>
				<View style={styles.modalContent}>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.title}>Select Beneficiary</Text>
						<TouchableOpacity
							onPress={onClose}
							style={styles.closeButton}>
							<X
								size={scale(24)}
								color={colors.neutral.neutral1}
								weight="regular"
							/>
						</TouchableOpacity>
					</View>

					{/* Search Bar */}
					<View style={styles.searchContainer}>
						<MagnifyingGlass
							size={scale(20)}
							color={colors.neutral.neutral3}
							weight="regular"
						/>
						<TextInput
							style={styles.searchInput}
							placeholder="Search by name or account number"
							placeholderTextColor={colors.neutral.neutral3}
							value={searchQuery}
							onChangeText={setSearchQuery}
						/>
						{searchQuery.length > 0 && (
							<TouchableOpacity
								onPress={() => setSearchQuery("")}>
								<X
									size={scale(20)}
									color={colors.neutral.neutral3}
									weight="regular"
								/>
							</TouchableOpacity>
						)}
					</View>

					{/* List */}
					{isLoading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator
								size="large"
								color={colors.primary.primary1}
							/>
						</View>
					) : filteredBeneficiaries.length === 0 ? (
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyTitle}>
								{searchQuery
									? "No results found"
									: "No saved beneficiaries"}
							</Text>
							<Text style={styles.emptySubtitle}>
								{searchQuery
									? "Try different search terms"
									: "Save beneficiaries for quick access"}
							</Text>
						</View>
					) : (
						<FlatList
							data={filteredBeneficiaries}
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }) => (
								<BeneficiaryCard
									beneficiary={item}
									onPress={() => handleSelect(item)}
								/>
							)}
							contentContainerStyle={styles.listContent}
							showsVerticalScrollIndicator={false}
						/>
					)}
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	modalContent: {
		backgroundColor: colors.neutral.neutral6,
		borderTopLeftRadius: scale(25),
		borderTopRightRadius: scale(25),
		maxHeight: "85%",
		paddingTop: spacing(20),
		paddingHorizontal: spacing(20),
		paddingBottom: spacing(40),
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: spacing(20),
	},
	title: {
		fontFamily: "Poppins",
		fontSize: fontSize(20),
		fontWeight: "600",
		color: colors.neutral.neutral1,
	},
	closeButton: {
		width: scale(32),
		height: scale(32),
		justifyContent: "center",
		alignItems: "center",
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.neutral.neutral5,
		borderRadius: scale(12),
		paddingHorizontal: spacing(12),
		paddingVertical: spacing(10),
		marginBottom: spacing(20),
	},
	searchInput: {
		flex: 1,
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		color: colors.neutral.neutral1,
		marginLeft: spacing(8),
		padding: 0,
	},
	listContent: {
		paddingBottom: spacing(20),
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: spacing(40),
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: spacing(60),
	},
	emptyTitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(16),
		fontWeight: "600",
		color: colors.neutral.neutral2,
		marginBottom: spacing(8),
	},
	emptySubtitle: {
		fontFamily: "Poppins",
		fontSize: fontSize(14),
		fontWeight: "400",
		color: colors.neutral.neutral3,
		textAlign: "center",
	},
});

export default BeneficiarySelector;
