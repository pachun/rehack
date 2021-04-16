import React from "react"
import { FlatList, View } from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import StoryListItem from "./StoryListItem"

const getTopStories = async (): Promise<HackerNewsItem[]> => {
  const topStoryIdsRequest = await fetch(
    `https://hacker-news.firebaseio.com/v0/topstories.json`,
  )
  const topStoryIds: number[] = (await topStoryIdsRequest.json()).slice(0, 20)
  const topStories = Promise.all(
    topStoryIds.map(
      (topStoryId): Promise<HackerNewsItem> => {
        return fetch(
          `https://hacker-news.firebaseio.com/v0/item/${topStoryId}.json`,
        ).then(topStoryRequest =>
          topStoryRequest.json().then(topStory => topStory),
        )
      },
    ),
  )
  return await topStories
}

interface TopStoriesProps {
  navigation: StackNavigationProp<{}>
}

const TopStories = ({ navigation }: TopStoriesProps) => {
  const insets = useSafeAreaInsets()
  const [isRefreshingTopStories, setIsRefreshingTopStories] = React.useState(
    false,
  )
  const [topStories, setTopStories] = React.useState<HackerNewsItem[]>([])

  const refreshTopStories = async () => {
    setIsRefreshingTopStories(true)
    setTopStories(await getTopStories())
    setIsRefreshingTopStories(false)
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      refreshTopStories()
    })
    return unsubscribe
  }, [navigation])

  return (
    <>
      <View style={{ backgroundColor: "#fff", height: insets.top }} />
      <FlatList
        onRefresh={refreshTopStories}
        refreshing={isRefreshingTopStories}
        style={{ backgroundColor: "#fff" }}
        data={topStories}
        renderItem={({ item: topStory }) => <StoryListItem story={topStory} />}
        keyExtractor={item => item.id.toString()}
      />
      <View style={{ backgroundColor: "#fff", height: insets.bottom }} />
    </>
  )
}

export default TopStories
