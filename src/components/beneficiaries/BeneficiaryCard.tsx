import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { User, Trash, PencilSimple } from "phosphor-react-native";
import { Beneficiary } from "@/types/beneficiary";
import colors from "@/constants/colors";

interface BeneficiaryCardProps {
	beneficiary: Beneficiary;
	onPress?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
	showActions?: boolean;
}

/**
 * Card component for displaying beneficiary information
 * Reusable in both selection and management contexts
 */
const BeneficiaryCard: React.FC<BeneficiaryCardProps> = ({
	beneficiary,
	onPress,
	onEdit,
	onDelete,
	showActions = false,
}) => {
	return (
		<TouchableOpacity
			style={styles.card}
			onPress={onPress}
			activeOpacity={onPress ? 0.7 : 1}
			disabled={!onPress}>
			<View style={styles.iconContainer}>
				<User
					size={24}
					color={colors.primary.primary1}
					weight="regular"
				/>
			</View>

			<View style={styles.infoContainer}>
				<View style={styles.topRow}>
					<Text
						style={styles.name}
						numberOfLines={1}>
						{beneficiary.nickname || beneficiary.accountName}
					</Text>
					{beneficiary.nickname && (
						<Text
							style={styles.accountName}
							numberOfLines={1}>
							{beneficiary.accountName}
						</Text>
					)}
				</View>

				<Text style={styles.accountNumber}>
					{beneficiary.accountNumber}
				</Text>

				{beneficiary.bankName && (
					<Text style={styles.bankName}>{beneficiary.bankName}</Text>
				)}
			</View>

			{showActions && (
				<View style={styles.actionsContainer}>
					{onEdit && (
						<TouchableOpacity
							style={styles.actionButton}
							onPress={(e) => {
								e.stopPropagation();
								onEdit();
							}}>
							<PencilSimple
								size={20}
								color={colors.primary.primary1}
								weight="regular"
							/>
						</TouchableOpacity>
					)}

					{onDelete && (
						<TouchableOpacity
							style={styles.actionButton}
							onPress={(e) => {
								e.stopPropagation();
								onDelete();
							}}>
							<Trash
								size={20}
								color={colors.semantic.error}
								weight="regular"
							/>
						</TouchableOpacity>
					)}
				</View>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.neutral.neutral6,
		borderRadius: 15,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: colors.neutral.neutral5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	infoContainer: {
		flex: 1,
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 4,
	},
	name: {
		fontFamily: "Poppins",
		fontSize: 15,
		fontWeight: "600",
		color: colors.neutral.neutral1,
		flex: 1,
	},
	accountName: {
		fontFamily: "Poppins",
		fontSize: 12,
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
	accountNumber: {
		fontFamily: "Poppins",
		fontSize: 13,
		fontWeight: "500",
		color: colors.primary.primary1,
		marginBottom: 2,
	},
	bankName: {
		fontFamily: "Poppins",
		fontSize: 11,
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
	actionsContainer: {
		flexDirection: "row",
		gap: 8,
		marginLeft: 8,
	},
	actionButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: colors.neutral.neutral5,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default BeneficiaryCard;
