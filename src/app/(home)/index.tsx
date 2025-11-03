import { StyleSheet, Text, View, ScrollView, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { primary, neutral } from '@/constants'
import { useRouter } from 'expo-router'
import {
  UserAvatar,
  NotificationBell,
  BankCard,
  CategoryCard,
} from '@/components'

const Home = () => {
  const router = useRouter();

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
            style={{ width: 28, height: 28 }}
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
        return null;
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <UserAvatar
            imageUri="https://i.pravatar.cc/150?img=12"
            size={50}
          />
          <Text style={styles.greeting}>Hi, Push Puttichai</Text>
        </View>
        <NotificationBell count={3} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* White rounded container */}
        <View style={styles.content}>
          {/* Bank Card */}
          <View style={styles.cardContainer}>
            <BankCard
              cardholderName="John Smith"
              cardNumber="•••• 4756 •••• 9018"
              balance="$3.469.52"
            />
          </View>

          {/* Categories Grid */}
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.title}
                icon={getIcon(category.icon)}
                onPress={() => {
                  if (category.icon === 'transfer') {
                    router.push('(transfer)/transfer');
                  } else if (category.icon === 'wallet') {
                    router.push('(account)/accountCard');
                  } else {
                    router.push('(account)/accountCard');
                  }
                }}
              />
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
  greeting: {
    fontSize: 16,
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: neutral.neutral6,
    lineHeight: 24,
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
})