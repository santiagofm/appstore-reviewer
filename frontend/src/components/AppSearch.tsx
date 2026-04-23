import { useState, useRef } from "react";
import { AutoComplete, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { searchApps, type AppResult } from "../api";

interface Props {
  onAppSelected: (appId: string, name: string) => void;
  disabled?: boolean;
}

export default function AppSearch({ onAppSelected, disabled }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<
    { value: string; label: React.ReactNode; name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (term: string) => {
    setInputValue(term);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!term.trim()) {
      setOptions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchApps(term);
        setOptions(
          results.map((r: AppResult) => ({
            value: r.appId,
            name: r.name,
            label: (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <img
                  src={r.icon}
                  alt=""
                  width={24}
                  height={24}
                  style={{ borderRadius: 6 }}
                />
                <span>{r.name}</span>
                <span style={{ color: "#999", fontSize: 12 }}>{r.seller}</span>
              </div>
            ),
          })),
        );
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (
    _appId: string,
    option: { value: string; name: string },
  ) => {
    onAppSelected(option.value, option.name);
    // Clear the input after selection so the app name isn't replaced by the ID
    setInputValue("");
    setOptions([]);
  };

  return (
    <AutoComplete
      value={inputValue}
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      style={{ width: "100%", maxWidth: 480 }}
    >
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search for an iOS app…"
        allowClear
        size="middle"
        disabled={disabled}
        onClear={() => {
          setInputValue("");
          setOptions([]);
        }}
        suffix={
          loading || disabled ? (
            <span style={{ fontSize: 12, color: "#999" }}>…</span>
          ) : null
        }
      />
    </AutoComplete>
  );
}
