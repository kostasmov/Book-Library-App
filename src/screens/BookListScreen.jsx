import React, { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';

import Animated, {
  interpolate,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedProps,
} from 'react-native-reanimated';

import { useTheme } from '@react-navigation/native';
import { SharedElement } from 'react-navigation-shared-element';
import { AntDesign } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import Text from '../components/Text';
import BookList from '../components/BookList';
import { useBooksState } from '../BookStore';

const lottie = require('../anims/landscape.json');

const LottieViewAnimated = Animated.createAnimatedComponent(LottieView);

// Приветствие относительно текущего времени суток
const getGreeting = () => {
  const hours = (new Date()).getHours();
  if (hours >= 6 && hours <= 12) {
    return 'Доброе утро!';
  }
  if (hours >= 12 && hours <= 17) {
    return 'Добрый день!';
  }
  return 'Добрый вечер!';
};

// Главный экран
function BookListScreen({ navigation }) {
  const {
    dark, width, colors, margin, navbar, normalize, ios,
  } = useTheme();
  const HEADER = normalize(300, 400);
  const { books } = useBooksState();

  const scrollY = useSharedValue(0);
  const loaded = useSharedValue(0);

  // Замедленная прогрузка экрана
  const onLayout = () => {
    loaded.value = withTiming(1, { duration: 300 });
  };

  // Анимация прокрутки
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: ({ contentOffset }) => {
      scrollY.value = contentOffset.y;
    },
  });

  // Переход на экран поиска книги
  const searchBooks = () => {
    navigation.push('BookSearch');
  };

  // Стили
  const styles = {
    screen: useAnimatedStyle(() => ({
      flex: 1,
      opacity: loaded.value,
      backgroundColor: colors.card,
    })),
    header: useAnimatedStyle(() => ({
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      paddingTop: navbar,
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'flex-end',
      backgroundColor: colors.background,
      height: interpolate(scrollY.value, [-HEADER, 0], [HEADER * 2, HEADER], 'clamp'),
      elevation: ios ? undefined : interpolate(scrollY.value, [HEADER - navbar, HEADER - navbar + 30], [0, 10], 'clamp'),
      shadowOpacity: ios ? interpolate(scrollY.value, [HEADER - navbar, HEADER - navbar + 30], [0, 0.75], 'clamp') : undefined,
      transform: [
        { translateY: interpolate(scrollY.value, [0, HEADER - navbar], [0, -HEADER + navbar], 'clamp') },
      ],
    })),
    logo: useAnimatedStyle(() => ({
      opacity: interpolate(scrollY.value, [0, HEADER - navbar], [1, 0], 'clamp'),
      transform: [
        { translateY: interpolate(scrollY.value, [-HEADER, 0], [-HEADER / 2, 0], 'clamp') },
      ],
    })),
    lottie: {
      top: 5,
      height: '100%',
      opacity: dark ? 0.8 : 1,
    },
    lottieProps: useAnimatedProps(() => ({
      speed: 0.5,
      autoPlay: true,
    })),
    welcomeText: useAnimatedStyle(() => ({
      marginBottom: margin / 2,
      opacity: interpolate(scrollY.value, [0, HEADER - navbar], [1, 0]),
    })),
    searchInput: useAnimatedStyle(() => ({
      borderRadius: 25,
      marginHorizontal: 20,
      paddingHorizontal: margin,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderColor: colors.background,
      marginBottom: interpolate(scrollY.value, [HEADER - navbar, HEADER - navbar + 30], [-25, 6], 'clamp'),
      height: interpolate(scrollY.value, [HEADER - navbar, HEADER - navbar + 30], [50, 38], 'clamp'),
      width: interpolate(scrollY.value, [HEADER - navbar, HEADER - navbar + 30], [width - margin * 2, width - margin], 'clamp'),
      borderWidth: interpolate(scrollY.value, [HEADER - navbar, HEADER - navbar + 30], [1, 0], 'clamp'),
    })),
    searchIcon: {
      width: 30,
      opacity: 0.3,
    },
    searchText: {
      height: 38,
      width: '100%',
      opacity: 0.25,
      lineHeight: 38,
      fontSize: 15,
    },
    scrollView: {
      paddingTop: HEADER,
    },
  };

  // Выборка книг для списков
  const reading = books.filter((b) => b.status === 'Reading');
  const completed = books.filter((b) => b.status === 'Completed');
  const wishlist = books.filter((b) => b.status === 'Wishlist');

  return (
    <Animated.View onLayout={onLayout} style={styles.screen}>
      <Animated.View style={styles.header}>
        <Animated.View style={styles.logo}>
          <LottieViewAnimated
            source={lottie}
            style={styles.lottie}
            animatedProps={styles.lottieProps}
          />
        </Animated.View>
        <Text animated style={styles.welcomeText} center size={20}>
          {getGreeting()}
        </Text>
        <Pressable onPress={searchBooks}>
          <SharedElement>
            <Animated.View size={15} style={styles.searchInput}>
              <View style={styles.searchIcon}>
                <AntDesign color={colors.text} name="search1" size={15} />
              </View>
              <Text style={styles.searchText}>Поиск книг</Text>
            </Animated.View>
          </SharedElement>
        </Pressable>
      </Animated.View>

      <Animated.ScrollView
        scrollEventThrottle={1}
        onScroll={scrollHandler}
        contentContainerStyle={styles.scrollView}
      >
        <BookList books={reading} title="Читаю" />
        <BookList books={completed} title="Прочитано" />
        <BookList books={wishlist} title="Буду читать" />
      </Animated.ScrollView>
    </Animated.View>
  );
}

export default React.memo(BookListScreen);
