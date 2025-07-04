import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import AppInitializer from './src/components/AppInitializer';

export default function App() {
  return (
    <AppInitializer>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AppInitializer>
  );
}
