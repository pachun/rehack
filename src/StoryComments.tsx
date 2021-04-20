import React from "react"
import { ActivityIndicator, FlatList, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Comment from "./Comment"

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
            <Comment comment={storyComment} />
          )}
          keyExtractor={item => item.id.toString()}
        />
        <View style={{ height: insets.bottom }} />
      </View>
    )
  }
}

export default StoryComments
