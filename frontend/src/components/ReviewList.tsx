import { useEffect, useState } from "react";
import {
  List,
  Card,
  Rate,
  Typography,
  Spin,
  Empty,
  Alert,
  Tag,
  Segmented,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getReviews, type Review } from "../api";

interface Props {
  appId: string;
  appName: string;
}

const RANGES = [
  { label: "48h", hours: 48 },
  { label: "Last week", hours: 168 },
  { label: "Last month", hours: 720 },
];

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function ReviewList({ appId, appName }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeHours, setRangeHours] = useState(48);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getReviews(appId, rangeHours);
        setReviews(data);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [appId, rangeHours]);

  const selectedLabel =
    RANGES.find((r) => r.hours === rangeHours)?.label ?? "48h";

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          {appName}
          {!loading && !error && (
            <Tag
              color="blue"
              style={{ marginLeft: 12, fontWeight: "normal", fontSize: 13 }}
            >
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </Tag>
          )}
        </Typography.Title>
        <Segmented
          options={RANGES.map((r) => ({ label: r.label, value: r.hours }))}
          value={rangeHours}
          onChange={(val) => setRangeHours(val as number)}
        />
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
          <Spin size="large" tip="Fetching reviews…" />
        </div>
      )}

      {!loading && error && (
        <Alert
          type="error"
          title="Failed to load reviews"
          description={error}
          showIcon
        />
      )}

      {!loading && !error && reviews.length === 0 && (
        <Empty
          style={{ marginTop: 64 }}
          description={
            <span>
              No reviews in the <strong>{selectedLabel}</strong> for{" "}
              <strong>{appName}</strong>
            </span>
          }
        />
      )}

      {!loading && !error && reviews.length > 0 && (
        <List
          dataSource={reviews}
          renderItem={(review) => (
            <Card
              size="small"
              style={{ marginBottom: 12 }}
              styles={{ body: { padding: "12px 16px" } }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <UserOutlined style={{ color: "#999" }} />
                  <Typography.Text strong style={{ fontSize: 13 }}>
                    {review.author}
                  </Typography.Text>
                  <Rate
                    disabled
                    value={review.score}
                    style={{ fontSize: 12 }}
                  />
                </div>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: 12, whiteSpace: "nowrap" }}
                >
                  {timeAgo(review.submitted_at)}
                </Typography.Text>
              </div>
              {review.title && (
                <Typography.Text
                  strong
                  style={{ display: "block", marginBottom: 4 }}
                >
                  {review.title}
                </Typography.Text>
              )}
              <Typography.Text style={{ fontSize: 13, color: "#444" }}>
                {review.content}
              </Typography.Text>
            </Card>
          )}
        />
      )}
    </div>
  );
}
