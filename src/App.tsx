import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import TheFrontPage from "./TheFrontPage"
import Story from "./Story"
import StoryComments from "./StoryComments"
{
  /* import Comments from "./Comments" */
}

const Stack = createStackNavigator()

const App = (): React.ReactElement => (
  <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="The Front Page"
        screenOptions={{
          headerTintColor: "#000",
          headerBackTitleStyle: {
            fontSize: 24,
            fontFamily: "Baskerville",
            fontWeight: "500",
          },
        }}
      >
        <Stack.Screen
          options={{ headerShown: false }}
          name="The Front Page"
          component={TheFrontPage}
        />
        <Stack.Screen options={{ title: "" }} name="Story" component={Story} />
        <Stack.Screen
          options={{ title: "" }}
          name="Story Comments"
          component={StoryComments}
        />
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
)

export default App
