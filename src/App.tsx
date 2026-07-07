import { SafeAreaProvider } from "react-native-safe-area-context";
import NodeSwitchScreen from "./NodeSwitchScreen";

function App() {
    return (
        <SafeAreaProvider>
            <NodeSwitchScreen />
        </SafeAreaProvider>
    );
}

export default App;
