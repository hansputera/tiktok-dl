import {Got} from 'got';
import type {
  ExtractedInfo as extractedInfo,
  MaintenanceProvider,
} from '../../@typings';

export type ExtractedInfo = extractedInfo;

/**
 * @class BaseProvider
 */
export abstract class BaseProvider {
    abstract client: Got;
    abstract maintenance?: MaintenanceProvider;
    abstract resourceName(): string;
    abstract fetch(url: string): Promise<ExtractedInfo>;
    abstract extract(html: string): ExtractedInfo;
};
