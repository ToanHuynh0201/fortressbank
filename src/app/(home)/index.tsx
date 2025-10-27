import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { primary, neutral, semantic } from '@/constants'
import { Bell, CreditCard, ArrowsLeftRight, ArrowLineDown, DeviceMobile, Receipt, PiggyBank, FileText, Users } from 'phosphor-react-native'

const Home = () => {
  const categories = [
    { id: 1, title: 'Account\nand Card', icon: 'wallet' },
    { id: 2, title: 'Transfer', icon: 'transfer' },
    { id: 3, title: 'Withdraw', icon: 'withdraw' },
    { id: 4, title: 'Mobile\nprepaid', icon: 'mobile' },
    { id: 5, title: 'Pay the\nbill', icon: 'bill' },
    { id: 6, title: 'Save\nonline', icon: 'save' },
    { id: 7, title: 'Credit\ncard', icon: 'credit' },
    { id: 8, title: 'Transaction\nreport', icon: 'report' },
    { id: 9, title: 'Beneficiary', icon: 'beneficiary' },
  ]

  const getIcon = (iconName: string) => {
    const iconProps = { size: 28, color: neutral.neutral6, weight: 'regular' as any }
    
    switch (iconName) {
      case 'wallet':
        return (
          <Image 
            source={require('../../../assets/icons/wallet.png')} 
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
        )
      case 'transfer':
        return (
          <Image 
            source={require('../../../assets/icons/transfer.png')} 
            style={{ width: 28, height: 28, backgroundColor: "transparent" }}
            resizeMode="contain"
          />
        )
      case 'withdraw':
        return (
          <Image 
            source={require('../../../assets/icons/withdraw.png')} 
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
        )
      case 'mobile':
        return (
          <Image 
            source={require('../../../assets/icons/mobile.png')} 
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
        )
      case 'bill':
        return (
          <Image 
            source={require('../../../assets/icons/bill.png')} 
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
        )
      case 'save':
        return (
          <Image 
            source={require('../../../assets/icons/save.png')} 
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
        )
      case 'credit':
        return (
          <Image 
            source={require('../../../assets/icons/credit.png')} 
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
        )
      case 'report':
        return (
          <Image 
            source={require('../../../assets/icons/reports.png')} 
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
        )
      case 'beneficiary':
        return (
          <Image 
            source={require('../../../assets/icons/beneficiary.png')} 
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
          />
        )
      default:
        return <CreditCard {...iconProps} />
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            style={styles.avatar}
            defaultSource={require('../../../assets/icon.png')}
          />
          <Text style={styles.greeting}>Hi, Push Puttichai</Text>
        </View>
        <TouchableOpacity style={styles.notificationContainer}>
          <Bell size={24} color={neutral.neutral6} weight="regular" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* White rounded container */}
        <View style={styles.content}>
          {/* Bank Card */}
          <View style={styles.cardContainer}>
            <View style={styles.cardBackground}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName}>John Smith</Text>
                </View>
                <View style={styles.cardNumber}>
                  <View style={styles.dots} />
                  <View style={styles.dots} />
                  <View style={styles.dots} />
                  <View style={styles.dots} />
                  <Text style={styles.cardNumberText}> 4756 </Text>
                  <View style={styles.dots} />
                  <View style={styles.dots} />
                  <View style={styles.dots} />
                  <View style={styles.dots} />
                  <Text style={styles.cardNumberText}> 9018</Text>
                </View>
                <Text style={styles.cardBalance}>$3.469.52</Text>
              </View>
            </View>
          </View>

          {/* Categories Grid */}
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                style={styles.categoryCard}
                activeOpacity={0.7}
              >
                <View style={styles.categoryIcon}>
                  {getIcon(category.icon)}
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: primary.primary1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: neutral.neutral6,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: neutral.neutral6,
    lineHeight: 24,
  },
  notificationContainer: {
    position: 'relative',
    width: 26,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: -6,
    width: 16,
    height: 18,
    borderRadius: 8,
    backgroundColor: semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: neutral.neutral6,
    lineHeight: 17,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    backgroundColor: neutral.neutral6,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 120,
    minHeight: '100%',
  },
  cardContainer: {
    marginBottom: 32,
  },
  cardBackground: {
    width: '100%',
    height: 221,
    position: 'relative',
  },
  card: {
    width: '100%',
    height: 204,
    backgroundColor: '#1E1671',
    borderRadius: 10,
    padding: 20,
    shadowColor: 'rgba(54, 41, 183, 0.07)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 30,
  },
  cardName: {
    fontSize: 24,
    fontFamily: 'Poppins',
    fontWeight: '400',
    color: neutral.neutral6,
    lineHeight: 36,
    marginBottom: 4,
  },
  cardType: {
    fontSize: 14,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: neutral.neutral6,
    lineHeight: 16,
  },
  cardNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dots: {
    width: 6,
    height: 6,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2.5,
  },
  cardNumberText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '400',
    color: neutral.neutral6,
    lineHeight: 24,
  },
  cardBalance: {
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: neutral.neutral6,
    lineHeight: 28,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '30%',
    height: 100,
    borderRadius: 15,
    padding: 16,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 2,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    backgroundColor: "transparent",
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  categoryTitle: {
    fontSize: 12,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: '#979797',
    lineHeight: 16,
    textAlign: 'center',
  },
})