import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import TheFrontPage from "./TheFrontPage"

const Stack = createStackNavigator()

const App = () => (
  <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="The Front Page" component={TheFrontPage} />
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
)

export default App
