import React from "react"
import { PlatformColor, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
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

const StoryTitle = ({ story }: { story: HackerNewsItem }) => {
  const navigation = useNavigation()
  return (
    <TouchableOpacity onPress={() => navigation.navigate("Story", { story })}>
      <Text
        style={{
          fontSize: 20,
          fontFamily: "NewYork",
        }}
      >
        {story.title}
      </Text>
    </TouchableOpacity>
  )
}

const StoryLocation = ({ story }: { story: HackerNewsItem }) => {
  return (
    <Text
      style={{
        color: PlatformColor("systemPurple"),
        fontSize: 14,
      }}
    >
      {storyLocation(story)}
    </Text>
  )
}

const StoryComments = ({ story }: { story: HackerNewsItem }) => {
  const navigation = useNavigation()
  const numberOfComments = story.descendants || 0
  const doNotActTouchable = { activeOpacity: 1 }
  return (
    <TouchableOpacity
      style={{ flexDirection: "row", justifyContent: "flex-end" }}
      onPress={() => {
        if (numberOfComments > 0) {
          navigation.navigate("Story Comments", { story })
        }
      }}
      hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
      {...(numberOfComments === 0 ? doNotActTouchable : {})}
    >
      <Text
        style={{
          fontSize: 14,
          color: PlatformColor("systemGray"),
        }}
      >
        {numberOfComments}
      </Text>
      <View style={{ width: 5 }} />
      <Ionicons name="chatbubble" size={14} color="gray" />
    </TouchableOpacity>
  )
}

const StoryListItem = ({
  story,
}: {
  story: HackerNewsItem
}): React.ReactElement => {
  return (
    <View
      style={{
        width: "92%",
        margin: "2.5%",
        marginRight: "4%",
        marginLeft: "4%",
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}
    >
      <View style={{ width: "86%" }}>
        <StoryTitle story={story} />
        <View style={{ height: 5 }} />
        <StoryLocation story={story} />
      </View>
      <View style={{ width: "10%", justifyContent: "flex-end" }}>
        <StoryComments story={story} />
      </View>
    </View>
  )
}

export default StoryListItem
