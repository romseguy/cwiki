import axios from "axios";
import { useEffect, useState } from "react";

type DiskUsage = {
  current?: number;
  max?: number;
  pct?: number | undefined;
};

export function useDiskUsage(): [DiskUsage, () => void] {
  const [diskUsage, setDiskUsage] = useState<DiskUsage>({});

  const refreshDiskUsage = async () => {
    try {
      const {
        data: { current, max }
      }: { data: { current: number; max: number } } = await axios.get(
        process.env.NEXT_PUBLIC_API + "/size"
      );
      setDiskUsage({
        current,
        max,
        pct: (current / max) * 100
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    refreshDiskUsage();
  }, []);

  return [diskUsage, refreshDiskUsage];
}
