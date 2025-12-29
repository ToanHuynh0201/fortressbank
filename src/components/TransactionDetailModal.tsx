import React, { useEffect, useState } from "react";
import {
	Modal,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	ScrollView,
} from "react-native";
import {
	X,
	CheckCircle,
	Clock,
	XCircle,
} from "phosphor-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { transferService, type Transaction } from "@/services/transferService";
import { primary, neutral, semantic } from "@/constants/colors";
import { scale, fontSize, spacing } from "@/utils/responsive";

interface TransactionDetailModalProps {
	visible: boolean;
	transactionId: string | null;
	onClose: () => void;
	accountId?: string | null;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
	visible,
	transactionId,
	onClose,
	accountId,
}) => {
	const [loading, setLoading] = useState(false);
	const [transaction, setTransaction] = useState<Transaction | null>(null);
	const [error, setError] = useState<string | null>(null);

	const isSent = transaction && accountId ? transaction.senderAccountId === accountId : false;
	const transactionColor = isSent ? semantic.error : semantic.success;

	useEffect(() => {
		if (visible && transactionId) {
			fetchTransactionDetail();
		}
	}, [visible, transactionId]);

	const fetchTransactionDetail = async () => {
		if (!transactionId) return;

		setLoading(true);
		setError(null);
		try {
			const response = await transferService.getTransactionById(
				transactionId,
			);
			if (response.code === 1000 && response.data) {
				setTransaction(response.data);
			} else {
				setError("Failed to load transaction details");
			}
		} catch (err) {
			console.error("Error fetching transaction detail:", err);
			setError("Failed to load transaction details");
		} finally {
			setLoading(false);
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return (
					<CheckCircle
						size={scale(24)}
						color={semantic.success}
						weight="fill"
					/>
				);
			case "PENDING":
			case "PENDING_OTP":
				return (
					<Clock
						size={scale(24)}
						color={semantic.warning}
						weight="fill"
					/>
				);
			case "FAILED":
			case "CANCELLED":
				return (
					<XCircle
						size={scale(24)}
						color={semantic.error}
						weight="fill"
					/>
				);
			default:
				return (
					<CheckCircle
						size={scale(24)}
						color={semantic.success}
						weight="fill"
					/>
				);
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "Completed";
			case "PENDING":
				return "Pending";
			case "PENDING_OTP":
				return "Pending OTP";
			case "FAILED":
				return "Failed";
			case "CANCELLED":
				return "Cancelled";
			default:
				return status;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return semantic.success;
			case "PENDING":
			case "PENDING_OTP":
				return semantic.warning;
			case "FAILED":
			case "CANCELLED":
				return semantic.error;
			default:
				return semantic.success;
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
			statusBarTranslucent>
			<View style={styles.overlay}>
				<TouchableOpacity
					style={styles.backdrop}
					activeOpacity={1}
					onPress={onClose}
				/>
				<Animated.View
					entering={FadeIn.duration(300)}
					style={styles.modalContainer}>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.headerTitle}>
							Transaction Details
						</Text>
						<TouchableOpacity
							onPress={onClose}
							style={styles.closeButton}>
							<X
								size={scale(24)}
								color={neutral.neutral1}
								weight="bold"
							/>
						</TouchableOpacity>
					</View>

					{/* Content */}
					<ScrollView
						style={styles.content}
						showsVerticalScrollIndicator={false}>
						{loading ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator
									size="large"
									color={primary.primary1}
								/>
								<Text style={styles.loadingText}>
									Loading details...
								</Text>
							</View>
						) : error ? (
							<View style={styles.errorContainer}>
								<XCircle
									size={scale(48)}
									color={semantic.error}
									weight="thin"
								/>
								<Text style={styles.errorText}>{error}</Text>
							</View>
						) : transaction ? (
							<Animated.View entering={FadeIn.delay(100)}>
								{/* Amount Section */}
								<View style={[
									styles.amountSection,
									{ backgroundColor: isSent ? '#FFF0F0' : '#F0FFF4' }
								]}>
									<Text style={styles.amountLabel}>
										{isSent ? 'Money Sent' : 'Money Received'}
									</Text>
									<Text style={[
										styles.amountValue,
										{ color: transactionColor }
									]}>
										{isSent ? '-' : '+'}$
										{transaction.amount.toLocaleString(
											"en-US",
											{
												minimumFractionDigits: 2,
											},
										)}
									</Text>
									{transaction.feeAmount > 0 && (
										<Text style={styles.feeText}>
											Fee: $
											{transaction.feeAmount.toFixed(2)}
										</Text>
									)}
								</View>

								{/* Status Section */}
								<View style={styles.statusSection}>
									{getStatusIcon(transaction.status)}
									<Text
										style={[
											styles.statusText,
											{
												color: getStatusColor(
													transaction.status,
												),
											},
										]}>
										{getStatusText(transaction.status)}
									</Text>
								</View>

								{/* Details Section */}
								<View style={styles.detailsSection}>
									<DetailRow
										label="Transaction ID"
										value={transaction.transactionId}
										copyable
									/>
									<DetailRow
										label="Type"
										value={transaction.transactionType.replace(
											/_/g,
											" ",
										)}
									/>
									<DetailRow
										label={isSent ? "To Account" : "From Account"}
										value={
											isSent
												? transaction.receiverAccountNumber
												: transaction.senderAccountNumber
										}
										highlight
										highlightColor={transactionColor}
									/>
									{transaction.description && (
										<DetailRow
											label="Description"
											value={transaction.description}
										/>
									)}
									<DetailRow
										label="Created At"
										value={formatDate(
											transaction.createdAt,
										)}
									/>
									{transaction.completedAt && (
										<DetailRow
											label="Completed At"
											value={formatDate(
												transaction.completedAt,
											)}
										/>
									)}
									{transaction.failureReason && (
										<DetailRow
											label="Failure Reason"
											value={transaction.failureReason}
											error
										/>
									)}
								</View>
							</Animated.View>
						) : null}
					</ScrollView>
				</Animated.View>
			</View>
		</Modal>
	);
};

interface DetailRowProps {
	label: string;
	value: string;
	copyable?: boolean;
	error?: boolean;
	highlight?: boolean;
	highlightColor?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({
	label,
	value,
	copyable,
	error,
	highlight,
	highlightColor,
}) => (
	<View style={styles.detailRow}>
		<Text style={styles.detailLabel}>{label}</Text>
		<Text
			style={[
				styles.detailValue,
				error && styles.detailValueError,
				highlight && { color: highlightColor, fontWeight: '700' }
			]}
			numberOfLines={copyable ? undefined : 2}>
			{value}
		</Text>
	</View>
);

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		padding: spacing(20),
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
	},
	modalContainer: {
		backgroundColor: neutral.neutral6,
		borderRadius: scale(24),
		width: "100%",
		maxWidth: 500,
		maxHeight: "85%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: scale(4) },
		shadowOpacity: 0.3,
		shadowRadius: scale(20),
		elevation: 999,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: spacing(20),
		borderBottomWidth: 1,
		borderBottomColor: neutral.neutral5,
	},
	headerTitle: {
		fontSize: fontSize(20),
		fontFamily: "Poppins",
		fontWeight: "700",
		color: neutral.neutral1,
	},
	closeButton: {
		padding: spacing(4),
	},
	content: {
		padding: spacing(20),
	},
	loadingContainer: {
		paddingVertical: spacing(60),
		alignItems: "center",
	},
	loadingText: {
		marginTop: spacing(12),
		fontSize: fontSize(14),
		fontFamily: "Poppins",
		color: neutral.neutral3,
	},
	errorContainer: {
		paddingVertical: spacing(60),
		alignItems: "center",
	},
	errorText: {
		marginTop: spacing(16),
		fontSize: fontSize(14),
		fontFamily: "Poppins",
		color: semantic.error,
	},
	amountSection: {
		alignItems: "center",
		paddingVertical: spacing(24),
		borderBottomWidth: 1,
		borderBottomColor: neutral.neutral5,
		marginHorizontal: spacing(-20),
		marginTop: spacing(-20),
		paddingHorizontal: spacing(20),
		borderTopLeftRadius: scale(24),
		borderTopRightRadius: scale(24),
	},
	amountLabel: {
		fontSize: fontSize(14),
		fontFamily: "Poppins",
		fontWeight: "600",
		color: neutral.neutral2,
		marginBottom: spacing(8),
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	amountValue: {
		fontSize: fontSize(42),
		fontFamily: "Poppins",
		fontWeight: "800",
	},
	feeText: {
		fontSize: fontSize(12),
		fontFamily: "Poppins",
		color: neutral.neutral3,
		marginTop: spacing(4),
	},
	statusSection: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: spacing(16),
		gap: spacing(8),
		borderBottomWidth: 1,
		borderBottomColor: neutral.neutral5,
	},
	statusText: {
		fontSize: fontSize(16),
		fontFamily: "Poppins",
		fontWeight: "600",
	},
	detailsSection: {
		paddingTop: spacing(16),
		gap: spacing(16),
	},
	detailRow: {
		gap: spacing(4),
	},
	detailLabel: {
		fontSize: fontSize(12),
		fontFamily: "Poppins",
		fontWeight: "500",
		color: neutral.neutral3,
		textTransform: "uppercase",
	},
	detailValue: {
		fontSize: fontSize(14),
		fontFamily: "Poppins",
		fontWeight: "500",
		color: neutral.neutral1,
	},
	detailValueError: {
		color: semantic.error,
	},
});

export default TransactionDetailModal;
