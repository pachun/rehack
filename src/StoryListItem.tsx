import React from "react"
import { PlatformColor, Text, TouchableOpacity, View } from "react-native"
import { useNavigation } from "@react-navigation/native"

const storyLocation = (story: HackerNewsItem) => {
  const urlBits = story.url?.split("/")
  const host = urlBits?.[2]
  if (host?.startsWith("en.")) {
    return host.slice(3)
  } else if (host?.startsWith("www.")) {
    return host.slice(4)
  } else if (host) {
    return host
  } else {
    return ""
  }
}

const StoryListItem = ({
  story,
}: {
  story: HackerNewsItem
}): React.ReactElement => {
  const navigation = useNavigation()

  return (
    <View style={{ padding: 10, paddingRight: 30, paddingLeft: 30 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ width: "100%" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Story", { story })}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "600",
              }}
            >
              {story.title}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 5 }} />
          <Text
            style={{
              color: PlatformColor("systemPink"),
              fontSize: 14,
            }}
          >
            {storyLocation(story)}
          </Text>
          <View style={{ height: 3 }} />
          <Text
            style={{
              fontSize: 14,
              color: PlatformColor("systemGray"),
            }}
          >
            {story.descendants ? story.descendants : 0}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default StoryListItem
