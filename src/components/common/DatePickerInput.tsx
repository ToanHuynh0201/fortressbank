import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Calendar } from 'phosphor-react-native';
import { neutral, primary } from '@/constants/colors';

interface DatePickerInputProps {
  value: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  isActive?: boolean;
  error?: string;
  containerStyle?: any;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onDateChange,
  placeholder = 'Chọn ngày sinh',
  isActive = false,
  error,
  containerStyle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(2000);

  // Parse existing value if any
  React.useEffect(() => {
    if (value) {
      const parts = value.split('/');
      if (parts.length === 3) {
        setSelectedDay(parseInt(parts[0]) || 1);
        setSelectedMonth(parseInt(parts[1]) || 1);
        setSelectedYear(parseInt(parts[2]) || 2000);
      }
    }
  }, [value]);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleConfirm = () => {
    const formattedDate = `${selectedDay.toString().padStart(2, '0')}/${selectedMonth.toString().padStart(2, '0')}/${selectedYear}`;
    onDateChange(formattedDate);
    setModalVisible(false);
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return monthNames[month - 1];
  };

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        style={[
          styles.input,
          isActive && styles.inputActive,
          error && styles.inputError,
        ]}
        onPress={() => setModalVisible(true)}>
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Calendar size={20} color={neutral.neutral3} weight="regular" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn ngày sinh</Text>
            </View>

            <View style={styles.pickerContainer}>
              {/* Day Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Ngày</Text>
                <ScrollView
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.pickerScrollContent}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDay === day && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedDay(day)}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedDay === day && styles.pickerItemTextSelected,
                        ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Tháng</Text>
                <ScrollView
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.pickerScrollContent}>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerItem,
                        selectedMonth === month && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedMonth(month)}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMonth === month && styles.pickerItemTextSelected,
                        ]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Năm</Text>
                <ScrollView
                  style={styles.pickerScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.pickerScrollContent}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedYear === year && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedYear(year)}>
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedYear === year && styles.pickerItemTextSelected,
                        ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: neutral.neutral4,
    borderRadius: 15,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
    color: neutral.neutral1,
    backgroundColor: neutral.neutral6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputActive: {
    borderColor: neutral.neutral1,
    borderWidth: 1,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  inputText: {
    fontSize: 14,
    fontWeight: '500',
    color: neutral.neutral1,
    fontFamily: 'Poppins',
  },
  placeholder: {
    color: neutral.neutral4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'Poppins',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: neutral.neutral6,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: neutral.neutral1,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: neutral.neutral2,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  pickerScroll: {
    maxHeight: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: neutral.neutral5,
  },
  pickerScrollContent: {
    paddingVertical: 4,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: primary.primary4,
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: neutral.neutral2,
    fontFamily: 'Poppins',
  },
  pickerItemTextSelected: {
    fontSize: 16,
    fontWeight: '700',
    color: primary.primary1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: neutral.neutral5,
  },
  confirmButton: {
    backgroundColor: primary.primary1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: neutral.neutral1,
    fontFamily: 'Poppins',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: neutral.neutral6,
    fontFamily: 'Poppins',
  },
});

export default DatePickerInput;
