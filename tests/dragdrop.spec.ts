import { type Page, test, expect } from '@playwright/test';
import path from 'path';
import os from 'os';
import { _electron as electron } from 'playwright';

test.describe('Playwright Drag and Drop Test', async () => {
   let page: Page;

   test.beforeEach(async () => {
      const username: string = process.env['USERPROFILE']?.split('\\')[2]!;
      const executablePath: string = `C:\\Users\\${username}\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe`;

      var app = await electron.launch({
         executablePath: executablePath,
         args: [`--user-data-dir=${path.join(os.tmpdir(), 'vscode-user-data', Date.now().toString())}`, '--disable-extension=eamodio.gitlens'],
      });

      page = await app.firstWindow();

      console.log('VS Code launched');
   });

   test('Sidebar drag-and-drop to webview with events', async () => {
      // Open the sidebar view
      await page.click('[aria-label="Drag Items"]');

      // Wait for the webview to be visible
      const webview0 = await page.waitForSelector('iframe');
      const frame0 = await webview0.contentFrame();
      expect(frame0).not.toBeNull();

      const webview = await frame0!.waitForSelector('iframe[title="Drag & Drop Webview"]');
      const frame = await webview.contentFrame();
      expect(frame).not.toBeNull();

      // Find the tree item in the sidebar
      const treeItem = await page.waitForSelector('[aria-label="Draggable Items"] [role="treeitem"]:has-text("Item 1")');
      expect(treeItem).not.toBeNull();

      // Find the dropzone in the webview
      const dropzone = await frame!.waitForSelector('#dropzone');
      expect(dropzone).not.toBeNull();

      await new Promise(_ => setTimeout(_, 2000));

      // Drag and drop with Shift held
      await treeItem.hover();
      await page.keyboard.down('Shift');
      await treeItem.dispatchEvent('dragstart');
      await dropzone.dispatchEvent('dragover');
      await dropzone.dispatchEvent('drop');
      await page.keyboard.up('Shift');

      // Check the dropzone text
      const dropText = await dropzone.textContent();
      expect(dropText).toContain('Item 1');
   });

   test('Sidebar drag-and-drop to webview with mouse move', async () => {
      // Open the sidebar view
      await page.click('[aria-label="Drag Items"]');

      // Wait for the webview to be visible
      const webview0 = await page.waitForSelector('iframe');
      const frame0 = await webview0.contentFrame();
      expect(frame0).not.toBeNull();

      const webview = await frame0!.waitForSelector('iframe[title="Drag & Drop Webview"]');
      const frame = await webview.contentFrame();
      expect(frame).not.toBeNull();

      // Find the tree item in the sidebar
      const treeItem = await page.waitForSelector('[aria-label="Draggable Items"] [role="treeitem"]:has-text("Item 1")');
      expect(treeItem).not.toBeNull();

      // Find the dropzone in the webview
      const dropzone = await frame!.waitForSelector('#dropzone');
      expect(dropzone).not.toBeNull();

      await new Promise(_ => setTimeout(_, 2000));

      const box = await treeItem.boundingBox();
      const dropBox = await dropzone.boundingBox();

      await page.keyboard.down('Shift');
      await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await page.mouse.down();
      await page.mouse.move(dropBox!.x + dropBox!.width / 2, dropBox!.y + dropBox!.height / 2);
      await page.mouse.up();
      await page.keyboard.up('Shift');

      // Check the dropzone text
      const dropText = await dropzone.textContent();
      expect(dropText).toContain('Item 1');
   });

   test('Sidebar drag-and-drop to webview with mouse hover', async () => {
      // Open the sidebar view
      await page.click('[aria-label="Drag Items"]');

      // Wait for the webview to be visible
      const webview0 = await page.waitForSelector('iframe');
      const frame0 = await webview0.contentFrame();
      expect(frame0).not.toBeNull();

      const webview = await frame0!.waitForSelector('iframe[title="Drag & Drop Webview"]');
      const frame = await webview.contentFrame();
      expect(frame).not.toBeNull();

      // Find the tree item in the sidebar
      const treeItem = await page.waitForSelector('[aria-label="Draggable Items"] [role="treeitem"]:has-text("Item 1")');
      expect(treeItem).not.toBeNull();

      // Find the dropzone in the webview
      const dropzone = await frame!.waitForSelector('#dropzone');
      expect(dropzone).not.toBeNull();

      await new Promise(_ => setTimeout(_, 2000));

      const dragElement = await page.locator('[aria-label="Draggable Items"] [role="treeitem"]:has-text("Item 1")');
      const dropElement = await page.frameLocator('iframe').frameLocator('iframe[title="Drag & Drop Webview"]').locator('#dropzone');

      await dragElement.waitFor({ state: 'visible' });
      await dropElement.waitFor({ state: 'visible' });

      await page.keyboard.down('Shift');
      await dragElement.hover();
      await page.mouse.down();
      await dropElement.hover();
      await dropElement.hover();   // repeat hover as said in the docs
      await page.mouse.up();
      await page.keyboard.up('Shift');

      // Check the dropzone text
      const dropText = await dropzone.textContent();
      expect(dropText).toContain('Item 1');
   });

   test('Sidebar drag-and-drop to webview with dragTo', async () => {
      // Open the sidebar view
      await page.click('[aria-label="Drag Items"]');

      // Wait for the webview to be visible
      const webview0 = await page.waitForSelector('iframe');
      const frame0 = await webview0.contentFrame();
      expect(frame0).not.toBeNull();

      const webview = await frame0!.waitForSelector('iframe[title="Drag & Drop Webview"]');
      const frame = await webview.contentFrame();
      expect(frame).not.toBeNull();

      // Find the tree item in the sidebar
      const treeItem = await page.waitForSelector('[aria-label="Draggable Items"] [role="treeitem"]:has-text("Item 1")');
      expect(treeItem).not.toBeNull();

      // Find the dropzone in the webview
      const dropzone = await frame!.waitForSelector('#dropzone');
      expect(dropzone).not.toBeNull();

      await new Promise(_ => setTimeout(_, 2000));

      await page.keyboard.down('Shift');

      const dragElement = await page.locator('[aria-label="Draggable Items"] [role="treeitem"]:has-text("Item 1")');
      const dropElement = await page.frameLocator('iframe').frameLocator('iframe[title="Drag & Drop Webview"]').locator('#dropzone');

      await dragElement.waitFor({ state: 'visible' });
      await dropElement.waitFor({ state: 'visible' });

      await dragElement.dragTo(dropElement);

      await page.keyboard.up('Shift');

      // Check the dropzone text
      const dropText = await dropzone.textContent();
      expect(dropText).toContain('Item 1');
   });
});
