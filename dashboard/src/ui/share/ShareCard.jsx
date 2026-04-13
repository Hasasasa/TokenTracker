import React, { forwardRef } from "react";
import { BroadsheetCard } from "./variants/BroadsheetCard.jsx";
import { AnnualReportCard } from "./variants/AnnualReportCard.jsx";
import { SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT, VARIANT_SIZES } from "./share-card-constants";

export { SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT, VARIANT_SIZES };

export const SHARE_VARIANTS = [
  { id: "annual-report", label: "Neon" },
  { id: "broadsheet", label: "Broadsheet" },
];

const VARIANT_MAP = {
  broadsheet: BroadsheetCard,
  "annual-report": AnnualReportCard,
};

export function getVariantSize(variant) {
  const s = VARIANT_SIZES[variant];
  return s || { width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT };
}

export const ShareCard = forwardRef(function ShareCard({ data, variant }, ref) {
  const CardComponent = VARIANT_MAP[variant] || BroadsheetCard;
  const { width, height } = getVariantSize(variant);
  return (
    <div
      ref={ref}
      data-share-card="true"
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <CardComponent data={data} />
    </div>
  );
});
