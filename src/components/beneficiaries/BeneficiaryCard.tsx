import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { User, Trash, PencilSimple } from "phosphor-react-native";
import { Beneficiary } from "@/types/beneficiary";
import colors from "@/constants/colors";
import { scale, fontSize, spacing } from "@/utils/responsive";

interface BeneficiaryCardProps {
	beneficiary: Beneficiary;
	onPress?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
	showActions?: boolean;
	isDeleting?: boolean;
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
	isDeleting = false,
}) => {
	return (
		<TouchableOpacity
			style={styles.card}
			onPress={onPress}
			activeOpacity={onPress ? 0.7 : 1}
			disabled={!onPress}>
			<View style={styles.iconContainer}>
				<User
					size={scale(24)}
					color={colors.primary.primary1}
					weight="regular"
				/>
			</View>

			<View style={styles.infoContainer}>
				<View style={styles.topRow}>
					<Text
						style={styles.name}
						numberOfLines={1}>
						{beneficiary.nickName || beneficiary.accountName}
					</Text>
					{beneficiary.nickName && (
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
							}}
							disabled={isDeleting}>
							<PencilSimple
								size={scale(20)}
								color={isDeleting ? colors.neutral.neutral4 : colors.primary.primary1}
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
							}}
							disabled={isDeleting}>
							{isDeleting ? (
								<ActivityIndicator size="small" color={colors.semantic.error} />
							) : (
								<Trash
									size={scale(20)}
									color={colors.semantic.error}
									weight="regular"
								/>
							)}
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
		borderRadius: scale(15),
		padding: spacing(16),
		marginBottom: spacing(12),
		borderWidth: 1,
		borderColor: colors.neutral.neutral5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: scale(2) },
		shadowOpacity: 0.05,
		shadowRadius: scale(8),
		elevation: 2,
	},
	iconContainer: {
		width: scale(48),
		height: scale(48),
		borderRadius: scale(24),
		backgroundColor: colors.primary.primary4,
		justifyContent: "center",
		alignItems: "center",
		marginRight: spacing(12),
	},
	infoContainer: {
		flex: 1,
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing(8),
		marginBottom: spacing(4),
	},
	name: {
		fontFamily: "Poppins",
		fontSize: fontSize(15),
		fontWeight: "600",
		color: colors.neutral.neutral1,
		flex: 1,
	},
	accountName: {
		fontFamily: "Poppins",
		fontSize: fontSize(12),
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
	accountNumber: {
		fontFamily: "Poppins",
		fontSize: fontSize(13),
		fontWeight: "500",
		color: colors.primary.primary1,
		marginBottom: spacing(2),
	},
	bankName: {
		fontFamily: "Poppins",
		fontSize: fontSize(11),
		fontWeight: "400",
		color: colors.neutral.neutral3,
	},
	actionsContainer: {
		flexDirection: "row",
		gap: spacing(8),
		marginLeft: spacing(8),
	},
	actionButton: {
		width: scale(36),
		height: scale(36),
		borderRadius: scale(18),
		backgroundColor: colors.neutral.neutral5,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default BeneficiaryCard;
