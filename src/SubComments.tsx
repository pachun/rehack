import React from "react"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Comment from "./Comment"

const getSubComments = async (
  comment: HackerNewsItem,
): Promise<HackerNewsItem[]> => {
  console.log(`HERE!`)
  const subCommentIds = comment.kids || []
  const subComments = Promise.all(
    subCommentIds.map(subCommentId =>
      fetch(
        `https://hacker-news.firebaseio.com/v0/item/${subCommentId}.json`,
      ).then(subCommentRequest =>
        subCommentRequest.json().then((subComment: HackerNewsItem) => {
          console.log(`subComment: ${JSON.stringify(subComment)}`)
          return subComment
        }),
      ),
    ),
  )
  return subComments
}

const SubComments = ({
  comment,
  level,
}: {
  comment: HackerNewsItem
  level: number
}): React.ReactElement | null => {
  const [subComments, setSubComments] = React.useState<HackerNewsItem[]>([])

  React.useEffect(() => {
    const x = async () => {
      setSubComments(await getSubComments(comment))
    }
    x()
  }, [comment])

  if (!comment.kids) {
    return null
  } else {
    console.log(`kids: ${comment.kids}`)
  }
  console.log(`---`)
  console.log(`subComments: ${JSON.stringify(subComments)}`)

  return (
    <View style={{ width: "100%", paddingLeft: 20 * level }}>
      {subComments.map(subComment => (
        <Comment comment={subComment} />
      ))}
    </View>
  )
}

export default SubComments
