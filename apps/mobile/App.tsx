import { color, radius, size, space, text } from "@fireguard/ui-tokens";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchPack, type JobPack } from "./src/api";
import {
  allDevices,
  checkSettings,
  initialPackState,
  MISSING_SETTINGS,
  packReducer,
} from "./src/packState";

// Expo inlines EXPO_PUBLIC_* at build time; only static dot access works.
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
// shortcut: stand-in for sign-in, local development only; P2.1 replaces it with Entra ID.
const devUserId = process.env.EXPO_PUBLIC_DEV_USER_ID;
const workOrder = process.env.EXPO_PUBLIC_WORK_ORDER;

type Device = JobPack["disciplines"][number]["devices"][number];

export default function App() {
  return (
    <SafeAreaProvider>
      <Screen />
    </SafeAreaProvider>
  );
}

function Screen() {
  const insets = useSafeAreaInsets();
  const [state, dispatch] = useReducer(packReducer, initialPackState);

  const load = useCallback(async () => {
    const settings = checkSettings({ apiUrl, userId: devUserId, workOrder });
    if (!settings.ok) {
      dispatch({ type: "loaded", result: settings });
      return;
    }
    dispatch({ type: "load" });
    const result = await fetchPack(settings.apiUrl, settings.userId, settings.workOrder);
    dispatch({ type: "loaded", result });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.appBar,
          {
            paddingTop: insets.top,
            minHeight: size.appBar + insets.top,
            paddingLeft: space.lg + insets.left,
            paddingRight: space.lg + insets.right,
          },
        ]}
      >
        <Text style={styles.appTitle}>FireGuard</Text>
        {devUserId ? (
          <Text style={styles.devBadge} accessibilityLabel="Signed in as development stand-in user">
            DEV USER
          </Text>
        ) : null}
      </View>
      {state.kind === "loading" ? (
        <View style={[styles.center, { paddingBottom: space.xxl + insets.bottom }]}>
          <ActivityIndicator size="large" color={color.fire} />
          <Text style={styles.secondary}>Loading job…</Text>
        </View>
      ) : state.kind === "error" ? (
        <View style={[styles.center, { paddingBottom: space.xxl + insets.bottom }]}>
          <View style={styles.errorPanel} accessibilityRole="alert">
            <Text style={styles.errorTitle}>Can't load job</Text>
            <Text style={styles.body}>{state.message}</Text>
          </View>
          {/* Settings are built into the app, so Retry cannot fix them. */}
          {state.message === MISSING_SETTINGS ? null : (
            <Pressable
              onPress={load}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <Job pack={state.pack} bottomInset={insets.bottom} />
      )}
    </View>
  );
}

function Job({ pack, bottomInset }: { pack: JobPack; bottomInset: number }) {
  const { workOrder: wo, site, disciplines } = pack;
  const devices = useMemo(() => allDevices(pack), [pack]);
  return (
    <FlashList
      data={devices}
      keyExtractor={(d) => d.id}
      renderItem={({ item }) => <DeviceRow device={item} />}
      ListEmptyComponent={<Text style={styles.secondary}>No devices on this job yet</Text>}
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.lg + bottomInset }}
      ListHeaderComponent={
        <View style={styles.card}>
          <Text style={styles.display}>{wo.softrendWo}</Text>
          <Text style={styles.heading}>{site.name}</Text>
          <Text style={styles.body}>{[site.address, site.city].filter(Boolean).join(", ")}</Text>
          <Text style={styles.body}>
            Scheduled{" "}
            {new Date(wo.scheduledAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </Text>
          {site.accessNotes ? <Text style={styles.body}>Access: {site.accessNotes}</Text> : null}
          {wo.coordinatorNote ? <Text style={styles.note}>Note: {wo.coordinatorNote}</Text> : null}
          {disciplines.map((d) => (
            <Text key={d.woDiscipline.id} style={styles.discipline}>
              {d.woDiscipline.discipline} · {d.template.id} · {d.devices.length} devices ·{" "}
              {d.progress.percentComplete}% complete
            </Text>
          ))}
        </View>
      }
    />
  );
}

function DeviceRow({ device }: { device: Device }) {
  const type = device.attributes.size_type;
  return (
    <View style={styles.row}>
      <Text style={styles.seq}>{device.seq}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.body}>{device.location ?? "No location"}</Text>
        <Text style={styles.secondary}>
          {[typeof type === "string" ? type : null, device.barcode].filter(Boolean).join(" · ")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bone },
  appBar: {
    backgroundColor: color.fire,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appTitle: { color: color.card, fontSize: text.heading, fontWeight: "700" },
  devBadge: {
    backgroundColor: color.warnBg,
    color: color.ink,
    fontSize: text.secondary,
    fontWeight: "700",
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.badge,
    overflow: "hidden",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.lg,
    padding: space.xxl,
  },
  card: {
    backgroundColor: color.card,
    borderRadius: radius.card,
    padding: space.lg,
    gap: space.xs,
    marginBottom: space.md,
  },
  display: { fontSize: text.display, fontWeight: "700", color: color.ink },
  heading: { fontSize: text.heading, fontWeight: "600", color: color.ink },
  body: { fontSize: text.body, color: color.ink },
  secondary: { fontSize: text.secondary, color: color.stone },
  note: {
    fontSize: text.body,
    color: color.ink,
    backgroundColor: color.fireTint,
    padding: space.sm,
  },
  discipline: { fontSize: text.body, fontWeight: "600", color: color.ink, marginTop: space.sm },
  errorPanel: {
    alignSelf: "stretch",
    backgroundColor: color.failBg,
    borderLeftWidth: space.xs,
    borderLeftColor: color.fail,
    borderRadius: radius.card,
    padding: space.lg,
    gap: space.xs,
  },
  errorTitle: { fontSize: text.heading, fontWeight: "700", color: color.ink },
  button: {
    minHeight: size.button,
    minWidth: 160,
    borderRadius: radius.button,
    backgroundColor: color.fire,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.xl,
  },
  buttonPressed: { backgroundColor: color.firePressed },
  buttonText: { color: color.card, fontSize: text.body, fontWeight: "700" },
  row: {
    minHeight: size.minTap,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.dust,
  },
  seq: { width: 32, fontSize: text.mono, color: color.stone, textAlign: "right" },
});
