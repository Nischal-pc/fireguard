import { color, radius, size, space, text } from "@fireguard/ui-tokens";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { fetchPack, type JobPack, type PackResult } from "./src/api";

// Expo inlines EXPO_PUBLIC_* at build time; only static dot access works.
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
// shortcut: stand-in for sign-in, local development only; P1 task 7 replaces it with Entra ID.
const devUserId = process.env.EXPO_PUBLIC_DEV_USER_ID;
const workOrder = process.env.EXPO_PUBLIC_WORK_ORDER;

type Device = JobPack["disciplines"][number]["devices"][number];

export default function App() {
  const [result, setResult] = useState<PackResult | null>(null);

  const load = useCallback(async () => {
    if (!apiUrl || !devUserId || !workOrder) {
      setResult({
        ok: false,
        error: "Missing settings. Create apps/mobile/.env from .env.example, then restart Expo.",
      });
      return;
    }
    setResult(null);
    setResult(await fetchPack(apiUrl, devUserId, workOrder));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.screen}>
      <View style={styles.appBar}>
        <Text style={styles.appTitle}>FireGuard</Text>
        {devUserId ? (
          <Text style={styles.devBadge} accessibilityLabel="Signed in as development stand-in user">
            DEV USER
          </Text>
        ) : null}
      </View>
      {result === null ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={color.fire} />
          <Text style={styles.secondary}>Loading job…</Text>
        </View>
      ) : !result.ok ? (
        <View style={styles.center}>
          <Text style={styles.error}>{result.error}</Text>
          <Pressable
            onPress={load}
            accessibilityRole="button"
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <Job pack={result.pack} />
      )}
    </View>
  );
}

function Job({ pack }: { pack: JobPack }) {
  const { workOrder: wo, site, disciplines } = pack;
  const devices = disciplines.flatMap((d) => d.devices);
  return (
    <FlashList
      data={devices}
      keyExtractor={(d) => d.id}
      renderItem={({ item }) => <DeviceRow device={item} />}
      contentContainerStyle={{ padding: space.lg }}
      ListHeaderComponent={
        <View style={styles.card}>
          <Text style={styles.display}>{wo.softrendWo}</Text>
          <Text style={styles.heading}>{site.name}</Text>
          <Text style={styles.body}>{[site.address, site.city].filter(Boolean).join(", ")}</Text>
          <Text style={styles.body}>Scheduled {new Date(wo.scheduledAt).toLocaleString()}</Text>
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
    minHeight: size.appBar,
    paddingTop: StatusBar.currentHeight ?? 0,
    paddingHorizontal: space.lg,
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
  error: { fontSize: text.body, color: color.fail, textAlign: "center" },
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
