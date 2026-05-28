import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  TrendMonitor,
  computeInterpolatedSeries,
  getTrendMonitorScale,
} from "../TrendMonitor.jsx";

describe("getTrendMonitorScale", () => {
  it("clips isolated outliers before deriving the chart max", () => {
    const scale = getTrendMonitorScale([80, 90, 95, 110, 120, 140, 10000]);

    expect(scale.rawMax).toBe(10000);
    expect(scale.effectiveMax).toBeLessThan(300);
    expect(scale.clippedValues.at(-1)).toBe(scale.effectiveMax);
    expect((scale.clippedValues[0] / scale.effectiveMax) * 100).toBeGreaterThan(30);
  });
});

describe("TrendMonitor", () => {
  it("keeps normal bars visible when a single day is an outlier", () => {
    const rows = [80, 90, 95, 110, 120, 140, 10000].map((value) => ({
      billable_total_tokens: value,
    }));

    const { container } = render(
      <TrendMonitor rows={rows} showTimeZoneLabel={false} />,
    );
    const bars = Array.from(container.querySelectorAll('[data-trend-bar="true"]'));

    expect(bars).toHaveLength(rows.length);
    expect(parseFloat(bars[0].parentElement?.style.height ?? "")).toBeGreaterThan(30);
    expect(parseFloat(bars.at(-1)?.parentElement?.style.height ?? "")).toBe(100);
    expect(bars[0].parentElement?.className).toContain("absolute");
    expect(bars[0].parentElement?.parentElement?.className).toContain("self-stretch");
  });

  it("renders real-zero observations as flat baseline bars, not interpolated", () => {
    // Two real values bracketing a real zero: the zero must NOT be filled in.
    const rows = [
      { billable_total_tokens: 100 },
      { billable_total_tokens: 0 },
      { billable_total_tokens: 100 },
    ];
    const { container } = render(
      <TrendMonitor rows={rows} showTimeZoneLabel={false} />,
    );
    const bars = Array.from(container.querySelectorAll('[data-trend-bar="true"]'));
    expect(bars).toHaveLength(3);
    // Real-zero gets the baseline pixel height, not a percentage interpolation.
    expect(bars[1].parentElement?.style.height).toBe("2px");
  });

  it("renders future bars at faint preview opacity with interpolated heights", () => {
    const rows = [
      { billable_total_tokens: 100 },
      { billable_total_tokens: 100 },
      { future: true },
    ];
    const { container } = render(
      <TrendMonitor rows={rows} showTimeZoneLabel={false} />,
    );
    const bars = Array.from(container.querySelectorAll('[data-trend-bar="true"]'));
    const previewBar = bars.at(-1);
    expect(previewBar?.style.opacity).toBe("0.35");
    // Predicted heights are clipped to the y-axis max and rendered as a percentage.
    expect(previewBar?.parentElement?.style.height).toMatch(/%$/);
  });
});

describe("computeInterpolatedSeries", () => {
  it("passes observed values through unchanged (including zero)", () => {
    expect(computeInterpolatedSeries([10, 0, 20])).toEqual([10, 0, 20]);
  });

  it("linearly interpolates between two bracketing observations", () => {
    const out = computeInterpolatedSeries([100, null, null, 400]);
    expect(out[1]).toBeCloseTo(200);
    expect(out[2]).toBeCloseTo(300);
  });

  it("extrapolates trailing gaps with decay toward zero", () => {
    const out = computeInterpolatedSeries([100, 100, 100, null, null]);
    // Each successive future step shrinks by the per-step decay factor.
    expect(out[3]).toBeGreaterThan(0);
    expect(out[4]).toBeGreaterThan(0);
    expect(out[4]).toBeLessThan(out[3]);
    // Extrapolation never exceeds the observed base.
    expect(out[3]).toBeLessThan(100);
  });

  it("returns all zeros when no observations exist", () => {
    expect(computeInterpolatedSeries([null, null, null])).toEqual([0, 0, 0]);
  });
});
