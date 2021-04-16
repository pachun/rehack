import React from "react"
import { PlatformColor, Text, TouchableOpacity, View } from "react-native"
import { FontAwesome5 } from "@expo/vector-icons"

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

const StoryListItem = ({ story }: { story: HackerNewsItem }) => (
  <View style={{ padding: 15, paddingRight: 30, paddingLeft: 30 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <TouchableOpacity style={{ maxWidth: "80%" }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "600",
          }}
        >
          {story.title}
        </Text>
        <View style={{ height: 5 }} />
        <Text
          style={{
            color: PlatformColor("systemPink"),
            fontSize: 14,
          }}
        >
          {storyLocation(story)}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ alignItems: "center" }}>
        <View>
          <Text
            style={{
              fontSize: 14,
              color: PlatformColor("systemGray"),
            }}
          >
            {story.descendants ? story.descendants : 0}
          </Text>
        </View>
        <View>
          <FontAwesome5
            style={{ marginTop: -22 }}
            name="comment-alt"
            size={34}
            color="#ddd"
          />
        </View>
      </TouchableOpacity>
    </View>
  </View>
)

export default StoryListItem
