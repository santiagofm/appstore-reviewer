import { useState } from "react";
import { List, Typography, Spin, Tag, Popconfirm, Tooltip } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useApps } from "../context/AppsContext";

interface Props {
  selectedAppId: string | null;
  onAppSelected: (appId: string, name: string) => void;
  onAppRemoved: (appId: string) => void;
}

export default function WatchingList({
  selectedAppId,
  onAppSelected,
  onAppRemoved,
}: Props) {
  const { apps, loading, remove } = useApps();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (appId: string) => {
    setRemovingId(appId);
    try {
      await remove(appId);
      onAppRemoved(appId);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <Spin size="small" style={{ padding: 16 }} />;

  if (apps.length === 0)
    return (
      <Typography.Text
        type="secondary"
        style={{ padding: "16px", display: "block", fontSize: 13 }}
      >
        No apps tracked yet. Search for one above.
      </Typography.Text>
    );

  return (
    <List
      dataSource={apps}
      renderItem={(app) => {
        const isSelected = app.app_id === selectedAppId;
        return (
          <List.Item
            style={{
              cursor: "pointer",
              padding: "10px 16px",
              background: isSelected ? "#e6f4ff" : "transparent",
              borderLeft: isSelected
                ? "3px solid #1677ff"
                : "3px solid transparent",
            }}
            onClick={() => onAppSelected(app.app_id, app.name ?? app.app_id)}
            actions={[
              <Popconfirm
                key="delete"
                title="Remove this app?"
                description="Its stored reviews will also be deleted."
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleRemove(app.app_id);
                }}
                onCancel={(e) => e?.stopPropagation()}
                okText="Remove"
                okButtonProps={{ danger: true }}
              >
                <Tooltip title="Remove">
                  <DeleteOutlined
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      color: removingId === app.app_id ? "#ccc" : "#bbb",
                      fontSize: 13,
                    }}
                  />
                </Tooltip>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <EyeOutlined
                  style={{
                    color: isSelected ? "#1677ff" : "#999",
                    marginTop: 3,
                  }}
                />
              }
              title={
                <Typography.Text strong={isSelected} style={{ fontSize: 13 }}>
                  {app.name ?? app.app_id}
                </Typography.Text>
              }
              description={
                <Tag style={{ fontSize: 11, marginTop: 2 }}>
                  ID: {app.app_id}
                </Tag>
              }
            />
          </List.Item>
        );
      }}
    />
  );
}
