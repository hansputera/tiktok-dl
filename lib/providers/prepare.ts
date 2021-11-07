import Puppeteer from 'puppeteer-core';
import {Providers} from '..';
import Chromium from 'chrome-aws-lambda';

/**
 * @class PreparePupet
 */
class PreparePupet {
  public isReady = false;
  public isRun = false;

  private providersNeed = Providers.filter((p) => p.withPuppet);
  /**
   * Prepare browser and page
   */
  public async exec(): Promise<void> {
    if (!this.providersNeed.length) {
      this.isRun = false;
      this.isReady = true;
      return;
    };
    const browser = await Puppeteer.launch({
      args: Chromium.args,
      executablePath: await Chromium.executablePath,
      headless: Chromium.headless,
    });
    this.isRun = true;
    for (const provider of this.providersNeed) {
      const page = await browser.newPage();
      await page.goto(provider.getURI());

      if (this.providersNeed.at(-1)?.resourceName() ===
        provider.resourceName()) {
        this.isReady = true;
      }
    }
  }
}

export const prepareChromium = new PreparePupet();
