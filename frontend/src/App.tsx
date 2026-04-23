import { useState } from "react";
import { Layout, Typography } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import AppSearch from "./components/AppSearch";
import WatchingList from "./components/WatchingList";
import ReviewList from "./components/ReviewList";
import { addApp } from "./api";
import { useApps } from "./context/AppsContext";

const { Header, Sider, Content } = Layout;

export default function App() {
  const { refresh } = useApps();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [selectedAppName, setSelectedAppName] = useState<string>("");
  const [adding, setAdding] = useState(false);

  const handleAppSelected = async (appId: string, name: string) => {
    setAdding(true);
    try {
      await addApp(appId);
      await refresh();
    } catch {
      // best-effort — still navigate to the app
    } finally {
      setAdding(false);
    }
    setSelectedAppId(appId);
    setSelectedAppName(name);
  };

  const handleAppRemoved = (appId: string) => {
    if (selectedAppId === appId) {
      setSelectedAppId(null);
      setSelectedAppName("");
    }
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 24px",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          height: "auto",
          lineHeight: "normal",
        }}
      >
        <AppstoreOutlined style={{ fontSize: 22, color: "#1677ff" }} />
        <Typography.Title
          level={4}
          style={{ margin: 0, color: "#1677ff", whiteSpace: "nowrap" }}
        >
          App Store Reviews
        </Typography.Title>
        <div style={{ flex: 1, maxWidth: 480 }}>
          <AppSearch onAppSelected={handleAppSelected} disabled={adding} />
        </div>
      </Header>

      <Layout style={{ overflow: "hidden" }}>
        <Sider
          width={260}
          breakpoint="md"
          collapsedWidth={0}
          style={{
            background: "#fafafa",
            borderRight: "1px solid #f0f0f0",
            overflowY: "auto",
            height: "100%",
          }}
        >
          <Typography.Text
            type="secondary"
            style={{
              display: "block",
              padding: "12px 16px 4px",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Watching
          </Typography.Text>
          <WatchingList
            selectedAppId={selectedAppId}
            onAppSelected={handleAppSelected}
            onAppRemoved={handleAppRemoved}
          />
        </Sider>

        <Content style={{ padding: 24, overflowY: "auto", height: "100%" }}>
          {selectedAppId ? (
            <ReviewList
              key={selectedAppId}
              appId={selectedAppId}
              appName={selectedAppName}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#bbb",
              }}
            >
              <AppstoreOutlined style={{ fontSize: 48, marginBottom: 16 }} />
              <Typography.Text type="secondary">
                Search for an app to see its reviews
              </Typography.Text>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
