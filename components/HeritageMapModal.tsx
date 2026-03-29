"use client";

import dynamic from "next/dynamic";

const DynamicMapPinView = dynamic(() => import("./MapPinView"), {
  ssr: false,
});

interface DynamicMapPinViewProps {
  isOpen: boolean;
  onClose: () => void;
  coordinates: [number, number];
  name: string;
}

export default function HeritageMapModal(props: DynamicMapPinViewProps) {
  return <DynamicMapPinView {...props} />;
}
