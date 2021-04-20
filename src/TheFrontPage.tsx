import React from "react"
import { FlatList, Text, View } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { DateTime } from "luxon"
import StoryListItem from "./StoryListItem"

const isFirstFrontPageLoadOrHasBeenFiveMinutesSinceLastFrontPageRefresh = async () => {
  const lastISO8601FrontPageRefreshTime = await AsyncStorage.getItem(
    "Last ISO8601 Front Page Refresh Time",
  )
  const isFirstFrontPageLoad = lastISO8601FrontPageRefreshTime === null
  if (isFirstFrontPageLoad) {
    return true
  } else {
    const lastFrontPageRefreshTime = DateTime.fromISO(
      lastISO8601FrontPageRefreshTime as string,
    )
    const currentTime = DateTime.now()
    const hasBeenFiveMinutesSinceLastFrontPageRefresh =
      lastFrontPageRefreshTime.plus({ minutes: 5 }) < currentTime
    if (hasBeenFiveMinutesSinceLastFrontPageRefresh) {
      return true
    } else {
      return false
    }
  }
}

const numberOfStoriesPerPage = 20

const getTheFrontPageStoriesIds = async (): Promise<number[]> => {
  const frontPageStoryIdsRequest = await fetch(
    `https://hacker-news.firebaseio.com/v0/topstories.json`,
  )
  const frontPageStoryIds: number[] = await frontPageStoryIdsRequest.json()
  return frontPageStoryIds
}

const whenScrolledToWithinHalfTheScreensHeightFromTheBottom = 0.5

const TheFrontPage = ({
  navigation,
}: {
  navigation: StackNavigationProp<Record<string, never>>
}): React.ReactElement => {
  const insets = useSafeAreaInsets()

  const [
    isRefreshingTheFrontPage,
    setIsRefreshingTheFrontPage,
  ] = React.useState(false)

  const [numberOfPagesLoaded, setNumberOfPagesLoaded] = React.useState<number>(
    0,
  )
  const [theFrontPageStoriesIds, setTheFrontPageStoriesIds] = React.useState<
    number[]
  >([])

  const [theFrontPageStories, setTheFrontPageStories] = React.useState<
    HackerNewsItem[]
  >([])

  const getNextPageOfFrontPageStories = React.useCallback(
    async (page: number = numberOfPagesLoaded) => {
      const positionOfFirstStoriesId = page * numberOfStoriesPerPage
      const idsOfStoriesOnNextPage = theFrontPageStoriesIds.slice(
        positionOfFirstStoriesId,
        positionOfFirstStoriesId + numberOfStoriesPerPage,
      )
      const nextPageOfStories = await Promise.all(
        idsOfStoriesOnNextPage.map(
          (idOfStoryOnNextPage): Promise<HackerNewsItem> => {
            return fetch(
              `https://hacker-news.firebaseio.com/v0/item/${idOfStoryOnNextPage}.json`,
            ).then(storyOnNextPageRequest =>
              storyOnNextPageRequest
                .json()
                .then(storyOnNextPage => storyOnNextPage),
            )
          },
        ),
      )
      const allStories =
        page === 0
          ? nextPageOfStories
          : [...theFrontPageStories, ...nextPageOfStories]
      setTheFrontPageStories(allStories)
      setNumberOfPagesLoaded(allStories.length / numberOfStoriesPerPage)
    },
    [numberOfPagesLoaded, theFrontPageStories, theFrontPageStoriesIds],
  )

  const refreshTheFrontPage = React.useCallback(async () => {
    AsyncStorage.setItem(
      "Last ISO8601 Front Page Refresh Time",
      DateTime.now().toString(),
    )
    setIsRefreshingTheFrontPage(true)
    setTheFrontPageStoriesIds(await getTheFrontPageStoriesIds())
    getNextPageOfFrontPageStories(0)
    setIsRefreshingTheFrontPage(false)
  }, [getNextPageOfFrontPageStories])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (
        (await isFirstFrontPageLoadOrHasBeenFiveMinutesSinceLastFrontPageRefresh()) ||
        (__DEV__ && theFrontPageStories.length === 0)
      ) {
        refreshTheFrontPage()
      }
    })
    return unsubscribe
  }, [navigation, theFrontPageStories.length, refreshTheFrontPage])

  return (
    <>
      <View style={{ backgroundColor: "#fff", height: insets.top }} />
      <FlatList
        onEndReachedThreshold={
          whenScrolledToWithinHalfTheScreensHeightFromTheBottom
        }
        onEndReached={getNextPageOfFrontPageStories}
        onRefresh={refreshTheFrontPage}
        refreshing={isRefreshingTheFrontPage}
        style={{ backgroundColor: "#fff" }}
        data={theFrontPageStories}
        renderItem={({ item: topStory }) => <StoryListItem story={topStory} />}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={
          <View
            style={{
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "NewYorkHeavyItalic",
                fontWeight: "500",
              }}
            >
              The Front Page
            </Text>
            <View style={{ height: 7 }} />
            <View style={{ height: 1, backgroundColor: "#000", width: 50 }} />
          </View>
        }
      />
      <View style={{ backgroundColor: "#fff", height: insets.bottom }} />
    </>
  )
}

export default TheFrontPage
