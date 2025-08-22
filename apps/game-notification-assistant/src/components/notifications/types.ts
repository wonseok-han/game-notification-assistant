export type ActiveOptionType = {
  value: boolean;
  label: string;
  color: string;
  bgColor: string;
};

export type EditingTimeType = {
  id: string;
  scheduledTime: string;
  isEnabled: boolean;
  rawText?: string;
  label?: string;
};
