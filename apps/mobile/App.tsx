import { color } from "@fireguard/ui-tokens";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: color.bone,
      }}
    >
      <Text style={{ color: color.ink }}>FireGuard</Text>
    </View>
  );
}
