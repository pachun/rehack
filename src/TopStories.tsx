import React from "react"
import {
  FlatList,
  PlatformColor,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { StackNavigationProp } from "@react-navigation/stack"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const getTopStories = async (): Promise<HackerNewsItem[]> => {
  const topStoryIdsRequest = await fetch(
    `https://hacker-news.firebaseio.com/v0/topstories.json`,
  )
  const topStoryIds: number[] = await topStoryIdsRequest.json()
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
        renderItem={({ item: topStory }) => {
          const storyLocation = () => {
            const urlBits = topStory.url?.split("/")
            const host = urlBits?.[2]
            if (host?.startsWith("www.")) {
              return host.slice(4)
            } else if (host) {
              return host
            } else {
              return ""
            }
          }
          return (
            <TouchableOpacity style={{ padding: 10 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "600",
                }}
              >
                {topStory.title}
              </Text>
              <View style={{ height: 5 }} />
              <Text
                style={{
                  color: PlatformColor("systemPink"),
                  fontSize: 14,
                }}
              >
                {storyLocation()}
              </Text>
            </TouchableOpacity>
          )
        }}
        keyExtractor={item => item.id.toString()}
      />
      <View style={{ backgroundColor: "#fff", height: insets.bottom }} />
    </>
  )
}

export default TopStories
