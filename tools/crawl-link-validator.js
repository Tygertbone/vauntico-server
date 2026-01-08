import { JSDOM } from 'jsdom';
import https from 'https';

class LinkValidator {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.domain = new URL(baseUrl).hostname;
    this.visitedPages = new Set();
    this.linkResults = [];
    this.pagesToVisit = [baseUrl];
  }

  async crawlAndValidate() {
    console.log(`🏁 Starting crawl of ${this.baseUrl}`);
    console.log(`🔍 Domain: ${this.domain}`);

    while (this.pagesToVisit.length > 0) {
      const currentPage = this.pagesToVisit.shift();

      if (this.visitedPages.has(currentPage)) {
        continue;
      }

      console.log(`\n📄 Crawling page: ${currentPage}`);
      this.visitedPages.add(currentPage);

      try {
        const pageResult = await this.validatePage(currentPage);
        if (pageResult) {
          const links = await this.extractLinks(currentPage);

          // Add internal pages to crawl queue
          for (const link of links) {
            if (link.internal && !this.visitedPages.has(link.url) && !this.pagesToVisit.includes(link.url)) {
              this.pagesToVisit.push(link.url);
            }

            // Validate each link
            const linkResult = await this.validateLink(currentPage, link);
            this.linkResults.push(linkResult);
          }
        }
      } catch (error) {
        console.log(`❌ Failed to crawl page ${currentPage}: ${error.message}`);
        this.linkResults.push({
          page: currentPage,
          link: currentPage,
          status: 'error',
          message: `Page crawl failed: ${error.message}`
        });
      }
    }

    return {
      summary: {
        pagesCrawled: this.visitedPages.size,
        totalLinks: this.linkResults.length,
        okLinks: this.linkResults.filter(r => r.status === 'ok').length,
        errorLinks: this.linkResults.filter(r => r.status === 'error').length
      },
      results: this.linkResults
    };
  }

  async validatePage(url) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, {
        headers: {
          'User-Agent': 'Vauntico Link Crawler 1.0'
        },
        timeout: 10000
      }, (res) => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              url,
              status: 'ok',
              statusCode: res.statusCode,
              content: data
            });
          } else {
            resolve({
              url,
              status: 'error',
              statusCode: res.statusCode,
              message: `HTTP ${res.statusCode}`
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async extractLinks(pageUrl) {
    try {
      const pageData = await this.validatePage(pageUrl);
      if (pageData.status !== 'ok') {
        return [];
      }

      const dom = new JSDOM(pageData.content);
      const document = dom.window.document;
      const linkElements = document.querySelectorAll('a[href]');
      const links = [];

      for (const element of linkElements) {
        const href = element.getAttribute('href');
        if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('#')) {
          continue;
        }

        let fullUrl;
        try {
          fullUrl = new URL(href, pageUrl).href;
        } catch {
          // Invalid URL format
          continue;
        }

        const isInternal = new URL(fullUrl).hostname === this.domain;
        const linkType = isInternal ? 'internal' : 'external';

        links.push({
          url: fullUrl,
          internal: isInternal,
          type: linkType,
          text: element.textContent.trim()
        });
      }

      return links;
    } catch (error) {
      console.log(`❌ Failed to extract links from ${pageUrl}: ${error.message}`);
      return [];
    }
  }

  async validateLink(pageUrl, link) {
    try {
      const result = await this.validatePage(link.url);
      return {
        page: pageUrl,
        link: link.url,
        status: result.status,
        message: result.status === 'ok' ?
          `${link.type} link valid (HTTP ${result.statusCode})` :
          `Link returned HTTP ${result.statusCode || 'error'}`
      };
    } catch (error) {
      return {
        page: pageUrl,
        link: link.url,
        status: 'error',
        message: `${link.type} link validation failed: ${error.message}`
      };
    }
  }
}

async function runLinkValidation() {
  const baseUrl = 'https://vauntico-mvp.vercel.app';
  const validator = new LinkValidator(baseUrl);

  console.log('🔗 Vauntico MVP Link Validator');
  console.log('===============================');

  try {
    const results = await validator.crawlAndValidate();

    console.log('\n📊 Validation Summary:');
    console.log(`   Pages crawled: ${results.summary.pagesCrawled}`);
    console.log(`   Links checked: ${results.summary.totalLinks}`);
    console.log(`   ✅ OK links: ${results.summary.okLinks}`);
    console.log(`   ❌ Error links: ${results.summary.errorLinks}`);

    console.log('\n📤 JSON Output:');
    console.log(JSON.stringify(results.results, null, 2));

    return results;
  } catch (error) {
    console.error('❌ Link validation failed:', error.message);
    throw error;
  }
}

// Export for use as module
export { LinkValidator, runLinkValidation };

// Run if called directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple check for if this is the main module (approximation for ES modules)
if (import.meta.url === `file://${process.argv[1]}`) {
  runLinkValidation().catch(error => {
    console.error('❌ Crawler execution failed:', error);
    process.exit(1);
  });
}
