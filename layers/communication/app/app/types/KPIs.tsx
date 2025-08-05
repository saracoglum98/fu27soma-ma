export enum KPIType {
  qualitative = "qualitative",
  quantitative = "quantitative"
}

export interface KPIBase {
  key: string;
}

export interface KPIResponse extends KPIBase {
  uuid: string;
  type: KPIType;
  value: string | null;
}

export interface QualitativeKPICreate extends KPIBase {}

export interface QuantitativeKPICreate extends KPIBase {
  value: string;
}

export interface QualitativeKPIUpdate {
  key?: string;
  value?: string;
}

export interface QuantitativeKPIUpdate {
  key?: string;
  value?: string;
}