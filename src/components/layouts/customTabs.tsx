import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import Entypo from '@expo/vector-icons/Entypo';
import { neutral, primary, semantic } from "@/constants";
import { useNotifications } from "@/contexts";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const PRIMARY_COLOR = neutral.neutral6;
const SECONDARY_COLOR = primary.primary1;

const getIconByRouteName = (routeName: string, color: string, badgeCount?: number) => {
  const iconSize = 18;
  
  const renderIcon = () => {
    switch (routeName) {
      case "index":
        return <Feather name="home" size={iconSize} color={color} />;
      case "notification":
        return <Feather name="bell" size={iconSize} color={color} />;
      case "search":
        return <Feather name="search" size={iconSize} color={color} />;
      case "setting":
        return <Ionicons name="settings-outline" size={iconSize} color={color} />;
      default:
        return <Feather name="home" size={iconSize} color={color} />;
    }
  };

  if (routeName === "notification" && badgeCount && badgeCount > 0) {
    return (
      <View style={styles.iconContainer}>
        {renderIcon()}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      </View>
    );
  }

  return renderIcon();
};

const CustomNavBar = ({
  state,
  descriptors,
  navigation,
} : BottomTabBarProps) => {
  const { unreadCount } = useNotifications();
  
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        if (["_sitemap", "+not-found"].includes(route.name)) return null;

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <AnimatedTouchableOpacity
            layout={LinearTransition.springify().mass(0.5)}
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabItem,
              { backgroundColor: isFocused ? SECONDARY_COLOR : "transparent" },
            ]}
          >
            {getIconByRouteName(
              route.name,
              isFocused ? PRIMARY_COLOR : SECONDARY_COLOR,
              route.name === "notification" ? unreadCount : undefined
            )}
            {isFocused && (
              <Animated.Text
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={styles.text}
              >
                {label as string}
              </Animated.Text>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    width: "80%",
    alignSelf: "center",
    bottom: 40,
    borderRadius: 40,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: SECONDARY_COLOR,
    boxShadow: '0 10px 20px 0 rgba(47, 0, 255, 0.4)',
    elevation: 10,
  },
  tabItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 30,
  },
  text: {
    color: PRIMARY_COLOR,
    marginLeft: 8,
    fontWeight: "500",
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: semantic.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'Poppins',
    fontWeight: '700',
    color: neutral.neutral6,
    lineHeight: 12,
  },
});

export default CustomNavBar;
