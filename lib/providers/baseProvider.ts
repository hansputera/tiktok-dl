import type {Page} from 'puppeteer-core';

export interface ExtractedInfo {
    error?: string;
    result?: {
        thumb?: string;
        urls: string[];
    }
};

/**
 * @class BaseProvider
 */
export abstract class BaseProvider {
  public withPuppet = false;
  private puppetPage?: Page;
    abstract resourceName(): string;
    abstract fetch(url: string): Promise<ExtractedInfo>;
    abstract extract(html: string): ExtractedInfo;
    abstract getURI(): string;
    /**
     *
     * @param {Page} page - Puppeteer page
     * @return {void}
     */
    public setPuppetPage(page: Page): void {
      this.puppetPage = page;
      return;
    }
};
