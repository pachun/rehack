import React from "react"
import { PlatformColor, Text, View } from "react-native"
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

const getSubComments = async (
  comment: HackerNewsItem,
): Promise<HackerNewsItem[]> => {
  const subCommentIds = comment.kids || []
  const subComments = Promise.all(
    subCommentIds.map(subCommentId =>
      fetch(
        `https://hacker-news.firebaseio.com/v0/item/${subCommentId}.json`,
      ).then(subCommentRequest =>
        subCommentRequest
          .json()
          .then((subComment: HackerNewsItem) => subComment),
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
}): React.ReactElement => {
  const [subComments, setSubComments] = React.useState<HackerNewsItem[]>([])

  React.useEffect(() => {
    getSubComments(comment).then(setSubComments)
  }, [comment])

  return (
    <View style={{ width: "100%", paddingLeft: 20 * level }}>
      {subComments.map(subComment => (
        <Comment comment={subComment} key={subComment.id.toString()} />
      ))}
    </View>
  )
}

const Comment = ({
  comment,
}: {
  comment: HackerNewsItem
}): React.ReactElement => {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 14, color: PlatformColor("systemPurple") }}>
          {comment.by}{" "}
        </Text>
        <Text style={{ fontSize: 14, color: PlatformColor("systemGray") }}>
          {postTimeOf(comment)}
        </Text>
      </View>
      <HTML
        baseFontStyle={{
          fontSize: 14,
        }}
        source={{
          html: comment.text
            ? formatHackerNewsComment(comment.text)
            : "<p></p>",
        }}
      />
      <View style={{ height: 20 }} />
      <SubComments comment={comment} level={1} />
    </View>
  )
}

export default Comment
