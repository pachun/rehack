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

const getTheFrontPageStories = async (): Promise<HackerNewsItem[]> => {
  const frontPageStoryIdsRequest = await fetch(
    `https://hacker-news.firebaseio.com/v0/topstories.json`,
  )
  const frontPageStoryIds: number[] = (
    await frontPageStoryIdsRequest.json()
  ).slice(0, numberOfStoriesPerPage)
  const topStories = Promise.all(
    frontPageStoryIds.map(
      (frontPageStoryId): Promise<HackerNewsItem> => {
        return fetch(
          `https://hacker-news.firebaseio.com/v0/item/${frontPageStoryId}.json`,
        ).then(frontPageStoryRequest =>
          frontPageStoryRequest.json().then(frontPageStory => frontPageStory),
        )
      },
    ),
  )
  return await topStories
}

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

  const [theFrontPageStories, setTheFrontPageStories] = React.useState<
    HackerNewsItem[]
  >([])

  const refreshTheFrontPage = async () => {
    AsyncStorage.setItem(
      "Last ISO8601 Front Page Refresh Time",
      DateTime.now().toString(),
    )
    setIsRefreshingTheFrontPage(true)
    setTheFrontPageStories(await getTheFrontPageStories())
    setIsRefreshingTheFrontPage(false)
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (
        await isFirstFrontPageLoadOrHasBeenFiveMinutesSinceLastFrontPageRefresh()
      ) {
        refreshTheFrontPage()
      }
    })
    return unsubscribe
  }, [navigation])

  return (
    <>
      <View style={{ backgroundColor: "#fff", height: insets.top }} />
      <FlatList
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
                fontSize: 24,
                fontFamily: "Baskerville",
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
