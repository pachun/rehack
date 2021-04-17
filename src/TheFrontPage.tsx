import React from "react"
import { FlatList, Text, View } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { DateTime } from "luxon"
import StoryListItem from "./StoryListItem"

const perPage = 20
const whenScrolledToWithinHalfTheScreensHeightFromTheBottom = 0.5

const getTheFrontPageStoriesIds = async (): Promise<number[]> => {
  const frontPageStoryIdsRequest = await fetch(
    `https://hacker-news.firebaseio.com/v0/topstories.json`,
  )
  const frontPageStoryIds: number[] = await frontPageStoryIdsRequest.json()
  return frontPageStoryIds
}

const getStories = async (storyIds: number[]) => {
  return await Promise.all(
    storyIds.map(
      (storyId): Promise<HackerNewsItem> => {
        return fetch(
          `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`,
        ).then(storyOnNextPageRequest =>
          storyOnNextPageRequest
            .json()
            .then(storyOnNextPage => storyOnNextPage),
        )
      },
    ),
  )
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

  const [numberOfPagesLoaded, setNumberOfPagesLoaded] = React.useState<number>(
    0,
  )
  const [theFrontPageStoriesIds, setTheFrontPageStoriesIds] = React.useState<
    number[]
  >([])

  const [theFrontPageStories, setTheFrontPageStories] = React.useState<
    HackerNewsItem[]
  >([])

  const refreshTheFrontPage = React.useCallback(async () => {
    setIsRefreshingTheFrontPage(true)
    AsyncStorage.setItem(
      "Last ISO8601 Front Page Refresh Time",
      DateTime.now().toString(),
    )
    const theFrontPageStoriesIds = await getTheFrontPageStoriesIds()
    setTheFrontPageStoriesIds(theFrontPageStoriesIds)
    setTheFrontPageStories(
      await getStories(theFrontPageStoriesIds.slice(0, perPage)),
    )
    setNumberOfPagesLoaded(1)
    setIsRefreshingTheFrontPage(false)
  }, [])

  const getNextPageOfFrontPageStories = async () => {
    const positionOfFirstStoriesId = numberOfPagesLoaded * perPage
    const idsOfStoriesOnNextPage = theFrontPageStoriesIds.slice(
      positionOfFirstStoriesId,
      positionOfFirstStoriesId + perPage,
    )
    const allStories = [
      ...theFrontPageStories,
      ...(await getStories(idsOfStoriesOnNextPage)),
    ]
    setTheFrontPageStories(allStories)
    setNumberOfPagesLoaded(allStories.length / perPage)
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      if (theFrontPageStories.length === 0) {
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
