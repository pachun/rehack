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

const getFrontPageStories = async (): Promise<HackerNewsStory[]> => {
  const frontPageRequest = await fetch(
    `https://hn.algolia.com/api/v1/search?tags=front_page`,
  )
  const frontPageStories = (await frontPageRequest.json()).hits
  return frontPageStories
}

interface FrontPageProps {
  navigation: StackNavigationProp<{}>
}

const FrontPage = ({ navigation }: FrontPageProps) => {
  const insets = useSafeAreaInsets()
  const [
    isRefreshingFrontPageStories,
    setIsRefreshingFrontPageStories,
  ] = React.useState(false)
  const [frontPageStories, setFrontPageStories] = React.useState<
    HackerNewsStory[]
  >([])

  const refreshFrontPageStories = async () => {
    setIsRefreshingFrontPageStories(true)
    setFrontPageStories(await getFrontPageStories())
    setIsRefreshingFrontPageStories(false)
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      refreshFrontPageStories()
    })
    return unsubscribe
  }, [navigation])

  return (
    <>
      <View style={{ backgroundColor: "#fff", height: insets.top }} />
      <FlatList
        onRefresh={refreshFrontPageStories}
        refreshing={isRefreshingFrontPageStories}
        style={{ backgroundColor: "#fff" }}
        data={frontPageStories}
        renderItem={({ item: topStory }) => {
          const storyLocation = () => {
            const urlBits = topStory.url.split("/")
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
        keyExtractor={item => item.objectID}
      />
      <View style={{ backgroundColor: "#fff", height: insets.bottom }} />
    </>
  )
}

export default FrontPage
