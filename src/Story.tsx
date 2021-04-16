import React from "react"
import { ActivityIndicator, View } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { WebView } from "react-native-webview"

const Story = ({
  route,
}: {
  route: { params: { story: HackerNewsItem } }
}): React.ReactElement => {
  const navigation = useNavigation()
  const story = route.params.story

  if (!story.url) {
    navigation.goBack()
    return <View />
  } else {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <WebView
          startInLoadingState
          source={{ uri: story.url }}
          renderLoading={() => (
            <View style={{ flex: 1, alignItems: "center" }}>
              <ActivityIndicator size="large" style={{ marginTop: -150 }} />
            </View>
          )}
        />
      </View>
    )
  }
}

export default Story
