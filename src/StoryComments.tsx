import React from "react"
import {
  ActivityIndicator,
  FlatList,
  PlatformColor,
  Text,
  View,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { DateTime } from "luxon"
import HTML from "react-native-render-html"

const formatHackerNewsComment = (htmlComment: string) => {
  return `<p>${htmlComment.split("<p>").join("</p><p>")}</p>`
}

const minutesInAnHour = 60

const postTimeOf = (storyComment: HackerNewsItem) => {
  if (storyComment.time) {
    const postTime = DateTime.fromSeconds(storyComment.time)
    const now = DateTime.now()
    const unroundedMinutesAgo = now.diff(postTime, "minutes").toObject().minutes
    const unroundedHoursAgo = now.diff(postTime, "hours").toObject().hours
    const unroundedDaysAgo = now.diff(postTime, "days").toObject().days
    if (unroundedMinutesAgo && unroundedMinutesAgo < minutesInAnHour) {
      return `${Math.round(unroundedMinutesAgo)} minutes ago`
    } else if (unroundedHoursAgo && unroundedHoursAgo === 1) {
      return `1 hour ago`
    } else if (
      unroundedHoursAgo &&
      unroundedHoursAgo > 1 &&
      unroundedHoursAgo < 6
    ) {
      const hoursAgo = Math.round(unroundedHoursAgo)
      return `${hoursAgo} hours ago`
    } else if (postTime.hasSame(DateTime.now(), "day")) {
      return postTime.toLocaleString(DateTime.TIME_SIMPLE)
    } else if (unroundedDaysAgo && Math.round(unroundedDaysAgo) === 1) {
      return `Yesterday, ${postTime.toLocaleString(DateTime.TIME_SIMPLE)}`
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
  const insets = useSafeAreaInsets()
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
      <View
        style={{
          backgroundColor: "#fff",
        }}
      >
        <FlatList
          style={{
            padding: 10,
            paddingRight: 30,
            paddingLeft: 30,
          }}
          ListHeaderComponent={() => <View style={{ height: 20 }} />}
          data={storyComments}
          renderItem={({ item: storyComment }) => (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ fontSize: 16, color: PlatformColor("systemPurple") }}
                >
                  {storyComment.by}{" "}
                </Text>
                <Text
                  style={{ fontSize: 16, color: PlatformColor("systemGray") }}
                >
                  {postTimeOf(storyComment)}
                </Text>
              </View>
              <HTML
                baseFontStyle={{
                  fontSize: 18,
                  lineHeight: 26,
                  letterSpacing: 0.25,
                }}
                source={{
                  html: storyComment.text
                    ? formatHackerNewsComment(storyComment.text)
                    : "<p></p>",
                }}
              />
              <View style={{ height: 20 }} />
            </View>
          )}
          keyExtractor={item => item.id.toString()}
        />
        <View style={{ height: insets.bottom }} />
      </View>
    )
  }
}

export default StoryComments
