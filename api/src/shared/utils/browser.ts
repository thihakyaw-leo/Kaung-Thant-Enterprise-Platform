/// <reference lib="dom" />
import puppeteer from '@cloudflare/puppeteer';
import { Env } from '../../index';

/**
 * AI-Powered Browser Automation using Gemini & Cloudflare Browser Rendering
 */
export async function runGeminiBrowserAutomation(
  env: Env, 
  targetUrl: string, 
  prompt: string
) {
  let browser: any;
  
  try {
    console.log(`[BrowserAI] Starting automation for: ${targetUrl}`);
    
    // 1. Launch/Connect to Cloudflare Browser
    browser = await puppeteer.launch(env.BROWSER);
    const page = await browser.newPage();
    
    // 2. Set Viewport & Navigate
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // 3. Get Page Context for Gemini
    const pageMetrics = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, input'));
      return {
        title: document.title,
        interactiveElements: elements.map((el: any) => ({
          tag: el.tagName,
          text: el.innerText || el.placeholder || '',
          id: el.id,
          className: el.className
        })).slice(0, 20) // Limit to top 20 elements for context
      };
    });

    // 4. Ask Gemini for the next action
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GOOGLE_GENERATIVE_AI_API_KEY}`;
    
    const aiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a browser automation agent. 
            Target Page: ${pageMetrics.title}
            Context: ${JSON.stringify(pageMetrics.interactiveElements)}
            User Goal: ${prompt}
            
            Return ONLY the CSS selector of the element to interact with, or 'DONE' if the goal is met.`
          }]
        }]
      })
    });

    const result = await aiResponse.json() as any;
    const aiDecision = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    console.log(`[BrowserAI] Gemini Decision: ${aiDecision}`);

    if (aiDecision && aiDecision !== 'DONE') {
      // 5. Execute AI Action
      await page.waitForSelector(aiDecision, { timeout: 5000 });
      await page.click(aiDecision);
      
      // Wait for navigation or change
      await new Promise(r => setTimeout(r, 2000));
    }

    // 6. Capture Final Result
    const finalScreenshot = await page.screenshot();
    
    return {
      success: true,
      decision: aiDecision,
      screenshot: finalScreenshot
    };

  } catch (error: any) {
    console.error('[BrowserAI] Fatal Error:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (browser) await browser.close();
  }
}
