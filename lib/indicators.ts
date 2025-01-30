/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import { type ISeriesApi, LineStyle } from "lightweight-charts";

export interface Candle {
  volume: any;
  volume: any;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SMAIndicator {
  calculate: (
    data: Candle[],
    period: number
  ) => { time: number; value: number }[];
  addToChart: (
    chart: any,
    visible: boolean,
    color: string,
    lineWidth: number,
    period: number
  ) => ISeriesApi<"Line">;
  update: (series: ISeriesApi<"Line">, data: Candle[], period: number) => void;
}

export const SMA: SMAIndicator = {
  calculate: (data: Candle[], period: number) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data
        .slice(i - period + 1, i + 1)
        .reduce((acc, candle) => acc + candle.close, 0);
      sma.push({ time: data[i].time, value: sum / period });
    }
    return sma;
  },

  addToChart: (chart, visible, color, lineWidth, period) => {
    const smaSeries = chart.addLineSeries({
      color: color,
      lineWidth: lineWidth,
      lineStyle: LineStyle.Solid,
      title: `SMA (${period})`,
      visible: visible,
    });
    return smaSeries;
  },

  update: (series, data, period) => {
    const smaData = SMA.calculate(data, period);
    series.setData(smaData);
  },
};
