export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  fill: false;
  borderDash?: number[];
  tension: number;
  borderColor: string;
}
