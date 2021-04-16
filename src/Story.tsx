import React from "react"
import { ActivityIndicator, View } from "react-native"
import { WebView } from "react-native-webview"

const Story = ({ route }: { route: { params: { story: HackerNewsItem } } }) => {
  const story = route.params.story

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <WebView
        startInLoadingState
        source={{ uri: story.url! }}
        renderLoading={() => (
          <View style={{ flex: 1, alignItems: "center" }}>
            <ActivityIndicator size="large" style={{ marginTop: -150 }} />
          </View>
        )}
      />
    </View>
  )
}

export default Story
