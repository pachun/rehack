import React from "react"
import { ActivityIndicator, FlatList, Text, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { DateTime } from "luxon"
import HTML from "react-native-render-html"

const minutesInAnHour = 60

const postTimeOf = (storyComment: HackerNewsItem) => {
  if (storyComment.time) {
    const postTime = DateTime.fromSeconds(storyComment.time)
    const unroundedMinutesAgo = DateTime.now()
      .diff(postTime, "minutes")
      .toObject().minutes
    if (unroundedMinutesAgo && unroundedMinutesAgo < minutesInAnHour) {
      return `${Math.round(unroundedMinutesAgo)} minutes ago`
    } else if (
      unroundedMinutesAgo &&
      unroundedMinutesAgo < minutesInAnHour * 6
    ) {
      return `${Math.round(unroundedMinutesAgo / 60)} hours ago`
    } else if (postTime.hasSame(DateTime.now(), "day")) {
      return postTime.toLocaleString(DateTime.TIME_SIMPLE)
    } else {
      return postTime.toLocaleString(DateTime.DATETIME_SHORT)
    }
  } else {
    return ""
  }
}

const getStoryComments = async (
  story: HackerNewsItem,
): Promise<HackerNewsItem[]> => {
  const commentIds = story.kids || []
  const comments = Promise.all(
    commentIds.map(commentId =>
      fetch(
        `https://hacker-news.firebaseio.com/v0/item/${commentId}.json`,
      ).then(commentRequest =>
        commentRequest.json().then((comment: HackerNewsItem) => comment),
      ),
    ),
  )
  return comments
}

const StoryComments = ({
  route,
}: {
  route: { params: { story: HackerNewsItem } }
}): React.ReactElement => {
  const navigation = useNavigation()
  const story = route.params.story
  const [isLoadingStoryComments, setIsLoadingStoryComments] = React.useState(
    true,
  )
  const [storyComments, setStoryComments] = React.useState<HackerNewsItem[]>([])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setStoryComments(await getStoryComments(story))
      setIsLoadingStoryComments(false)
    })
    return unsubscribe
  }, [navigation, story])

  if (isLoadingStoryComments) {
    return (
      <View
        style={{
          backgroundColor: "#fff",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    )
  } else {
    return (
      <FlatList
        style={{ backgroundColor: "#fff" }}
        data={storyComments}
        renderItem={({ item: storyComment }) => (
          <View>
            <Text style={{ fontSize: 20 }}>
              {storyComment.by} @ {postTimeOf(storyComment)}
            </Text>
            <HTML source={{ html: storyComment.text || "<p></p>" }} />
          </View>
        )}
        keyExtractor={item => item.id.toString()}
      />
    )
  }
}

export default StoryComments
