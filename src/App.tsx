import React from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import FrontPage from "./FrontPage"

const Stack = createStackNavigator()

const App = () => (
  <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Front Page" component={FrontPage} />
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
)

export default App
