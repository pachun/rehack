import React from "react"
import { ActivityIndicator, Text, View } from "react-native"
import { useNavigation } from "@react-navigation/native"

const getComments = async (
  hackerNewsItem: HackerNewsItem,
): Promise<Comment[]> => {
  const commentIds = hackerNewsItem.kids || []
  const comments = Promise.all(
    commentIds.map(commentId =>
      fetch(
        `https://hacker-news.firebaseio.com/v0/item/${commentId}.json`,
      ).then(commentRequest =>
        commentRequest.json().then((comment: HackerNewsItem) => ({
          comment,
          subComments: getComments(comment).then(comment => comment),
        })),
      ),
    ),
  )
  return comments
}

const Comments = ({
  route,
}: {
  route: { params: { story: HackerNewsItem } }
}): React.ReactElement => {
  const navigation = useNavigation()
  const story = route.params.story
  const [isLoadingStoryComments, setIsLoadingStoryComments] = React.useState(
    true,
  )
  const [storyComments, setStoryComments] = React.useState<Comment[]>([])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      setStoryComments(await getComments(story))
      setIsLoadingStoryComments(false)
    })
    return unsubscribe
  }, [navigation, story])

  if (isLoadingStoryComments) {
    return <ActivityIndicator />
  } else {
    return (
      <View>
        <Text>{JSON.stringify(storyComments)}</Text>
      </View>
    )
  }
}

export default Comments
