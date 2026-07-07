import Clipboard from "@react-native-clipboard/clipboard";
import { useEffect, useState, useRef, useCallback } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Todo: 未知
type NodeStatus = "測速中" | "正常" | "異常" | "未知";

interface NodeInfo {
    id: string;
    name: string;
    url: string;
    status: NodeStatus;
    ping: string;
}

// 節點初始數據
const INITIAL_NODES: NodeInfo[] = [
    { id: "1", name: "節點01", url: "https://www.google.com.hk", status: "測速中", ping: "" },
    { id: "2", name: "節點02", url: "https://hk.yahoo.com", status: "測速中", ping: "" },
    { id: "3", name: "節點03", url: "http://bremsregelungen.xyz", status: "測速中", ping: "" },
    { id: "4", name: "節點04", url: "https://www.bing.com", status: "測速中", ping: "" },
    { id: "5", name: "節點05", url: "https://1.1.1.1", status: "測速中", ping: "" },
    { id: "6", name: "節點06", url: "https://8.8.8.8", status: "測速中", ping: "" },
    { id: "7", name: "節點07", url: "https://www.baidu.com", status: "測速中", ping: "" },
    { id: "8", name: "節點08", url: "https://www.apple.com", status: "測速中", ping: "" },
    { id: "9", name: "節點09", url: "https://github.com", status: "測速中", ping: "" },
    { id: "10", name: "節點10", url: "https://www.amazon.com", status: "測速中", ping: "" },
    { id: "11", name: "節點11", url: "https://www.microsoft.com", status: "測速中", ping: "" },
    { id: "12", name: "節點12", url: "https://www.wikipedia.org", status: "測速中", ping: "" },
];

const CONFIG = {
    TIMEOUT: 1000,
};

export default function NodeSwitchScreen() {
    const [selectedId, setSelectedId] = useState("1");
    const { testInProgress, nodes, testTime, runTest } = useNodeSpeedTest(INITIAL_NODES);
    const { visible: showToast, show: triggerToast } = useToast();

    const handleCopyResults = () => {
        const text = nodes.map(n => (n.status === "正常" ? `${n.name}: 正常${n.ping}` : `${n.name}: ${n.status}`)).join("\n");
        Clipboard.setString(text);
        triggerToast();
    };

    return (
        <SafeAreaView edges={["top"]} style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* 頂部導覽列 */}
            <View style={styles.header}>
                {/* todo: back button function */}
                <Pressable style={({ pressed }) => [styles.backButton, pressed && styles.pressedButtonOpacity]} hitSlop={15}>
                    <View style={styles.backIcon} />
                </Pressable>
                <Text style={styles.headerTitle}>節點切換</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* 功能操作列 (手動測速與時間) */}
            <View style={styles.actionRow}>
                <Pressable
                    onPress={runTest}
                    style={({ pressed }) => [styles.speedTestButton, pressed && styles.pressedButtonOpacity, testInProgress && { backgroundColor: "#A0A0A0" }]}
                    disabled={testInProgress}
                >
                    <View style={styles.gaugeIcon}>
                        <View style={styles.gaugeArrow} />
                    </View>
                    <Text style={styles.speedTestText}>手動測速</Text>
                </Pressable>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeLabel}>測速時間</Text>
                    <Text style={styles.timeValue}>{testTime}</Text>
                </View>
            </View>

            {/* 中間可滾動的節點列表區域 */}
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {nodes.map(item => {
                    const isSelected = item.id === selectedId;
                    const isHealthy = item.status === "正常";
                    const isError = item.status === "異常";

                    return (
                        <Pressable
                            key={item.id}
                            style={({ pressed }) => [styles.nodeItem, pressed && styles.pressedButtonOpacity]}
                            onPress={() => {
                                if (item.status === "正常" && !testInProgress) setSelectedId(item.id);
                            }}
                        >
                            {/* 節點名稱 */}
                            <Text style={styles.nodeName}>{item.name}</Text>

                            {/* 狀態與延遲 - 改回 100% 安全的行內條件式，杜絕編譯器誤判 */}
                            <View style={styles.statusContainer}>
                                <View style={[styles.statusDot, isHealthy && styles.statusDotHealthy, isError && styles.statusDotError]} />
                                <Text style={[styles.statusText, isHealthy && styles.statusTextHealthy, isError && styles.statusTextError]}>
                                    {item.status} {item.ping}
                                </Text>
                            </View>

                            {/* 右側勾選圖標 */}
                            <View style={styles.checkmarkContainer}>{isSelected && <Text style={styles.checkmark}>✓</Text>}</View>
                        </Pressable>
                    );
                })}
            </ScrollView>

            {/* 底部固定說明的文字與按鈕區塊 */}
            <View style={styles.bottomContainer}>
                <Pressable
                    onPress={handleCopyResults}
                    style={({ pressed }) => [styles.copyButton, pressed && styles.pressedButtonOpacity, testInProgress && { backgroundColor: "#A0A0A0" }]}
                    disabled={testInProgress}
                >
                    <Text style={styles.copyButtonText}>複製測速結果</Text>
                </Pressable>

                <Text style={styles.bottomText}>在使用應用時，如果遇到數據載入問題，你可以通過手動切換網路節點來提升存取體驗。</Text>
                <Text style={[styles.bottomText, { marginTop: 16 }]}>
                    網路節點測速的狀態提示分為三種：正常、異常和未知。這些狀態是根據你當前的網路情況而定的。你可以通過切換手機的網路類型（如4G/5G、WiFi）來手動測速網路節點的健康狀況，並選擇最適合你的節點。
                </Text>
            </View>

            {/* 「已複製」暫時性提示浮窗 */}
            {showToast && (
                <View style={styles.toastContainer}>
                    <Text style={styles.toastText}>已複製</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const testNodeLatency = async (nodeUrl: string): Promise<{ ping: string; status: NodeStatus }> => {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

    try {
        await fetch(nodeUrl, {
            method: "HEAD",
            headers: { "Cache-Control": "no-cache" },
            signal: controller.signal,
        });

        return { ping: `（${Date.now() - startTime}ms）`, status: "正常" };
    } catch {
        return { ping: "", status: "異常" };
    } finally {
        clearTimeout(timeoutId);
    }
};

const getFormattedDate = () => {
    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

function useNodeSpeedTest(initialNodes: NodeInfo[]) {
    const [nodes, setNodes] = useState(initialNodes);
    const [testTime, setTestTime] = useState("---- -- -- --:--:--");
    const [testInProgress, setTestInProgress] = useState(false);

    const runTest = useCallback(async () => {
        setTestInProgress(true);
        setTestTime(getFormattedDate());
        setNodes(initialNodes);

        for (const node of INITIAL_NODES) {
            const result = await testNodeLatency(node.url);
            setNodes(prev => prev.map(n => (n.id === node.id ? { ...n, ...result } : n)));
        }

        setTestInProgress(false);
    }, [initialNodes]);

    useEffect(() => {
        runTest();
    }, []);

    return { testInProgress, nodes, testTime, runTest };
}

function useToast(duration = 2000) {
    const [visible, setVisible] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        [],
    );

    const show = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        setVisible(true);
        timer.current = setTimeout(() => setVisible(false), duration);
    }, [duration]);

    return { visible, show };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    backButton: {
        justifyContent: "center",
        alignItems: "center",
        width: 32,
        height: 32,
    },
    backIcon: {
        width: 12,
        height: 12,
        borderLeftWidth: 2,
        borderBottomWidth: 2,
        borderColor: "#000000",
        transform: [{ rotate: "45deg" }],
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000000",
    },
    headerSpacer: {
        width: 32,
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 25,
    },
    speedTestButton: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#3582E8",
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 12,
    },
    pressedButtonOpacity: {
        opacity: 0.5,
    },
    gaugeIcon: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: "#4A90E2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 6,
    },
    gaugeArrow: {
        width: 2,
        height: 6,
        backgroundColor: "#4A90E2",
        transform: [{ rotate: "45deg" }],
        marginTop: -2,
    },
    speedTestText: {
        fontSize: 14,
        color: "#3582E8",
    },
    timeContainer: {
        alignItems: "flex-end",
    },
    timeLabel: {
        fontSize: 11,
        color: "#B8B8B8",
    },
    timeValue: {
        fontSize: 12,
        color: "#B8B8B8",
        marginTop: 2,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    nodeItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 18,
    },
    nodeName: {
        flex: 1.2,
        fontSize: 16,
        color: "#333333",
    },
    statusContainer: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#999999",
        marginRight: 8,
    },
    statusDotHealthy: {
        backgroundColor: "#52C41A",
    },
    statusDotError: {
        backgroundColor: "#FF4D4F",
    },
    statusText: {
        fontSize: 16,
        color: "#999999",
    },
    statusTextHealthy: {
        color: "#52C41A",
    },
    statusTextError: {
        color: "#FF4D4F",
    },
    checkmarkContainer: {
        width: 30,
        alignItems: "flex-end",
    },
    checkmark: {
        fontSize: 16,
        color: "#3582E8",
        fontWeight: "bold",
    },
    bottomContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: "#FFFFFF",
    },
    copyButton: {
        backgroundColor: "#3582E8",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    copyButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
    bottomText: {
        fontSize: 13,
        color: "#A0A0A0",
        lineHeight: 21,
        textAlign: "justify",
    },
    toastContainer: {
        position: "absolute",
        bottom: "40%",
        left: "50%",
        transform: [{ translateX: -60 }],
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 20,
        zIndex: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    toastText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
});
