import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import TopStories from "./TopStories"

const Stack = createStackNavigator()

const App = () => (
  <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Top Stories" component={TopStories} />
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
)

export default App
