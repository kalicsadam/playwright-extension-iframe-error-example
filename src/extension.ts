import * as vscode from 'vscode';

function getWebviewContent(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Drag & Drop Webview</title>
        <style>
          body { font-family: sans-serif; }
          #dropzone {
            width: 100%;
            height: 200px;
            border: 2px dashed #888;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 40px;
            background: #f9f9f9;
            font-size: 1.2em;
          }
        </style>
      </head>
      <body>
        <h2>Drag items from the sidebar into the dropzone</h2>
        <div id="dropzone">Drop draggable items here</div>
        <script>
          const dropzone = document.getElementById('dropzone');
          dropzone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropzone.style.background = '#e0ffe0';
          });
          dropzone.addEventListener('dragleave', function(e) {
            dropzone.style.background = '#f9f9f9';
          });
          dropzone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropzone.style.background = '#f9f9f9';
            var data = e.dataTransfer.getData('application/vnd.code.tree.draggableItemsView');
            if (!data) {
              data = e.dataTransfer.getData('text/plain');
            }
            dropzone.textContent = 'Dropped: ' + data;
          });
        </script>
      </body>
      </html>
    `;
}

const openWebviewCommand = 'draggableItemsView.openWebview';

export function activate(context: vscode.ExtensionContext) {
  // Remove duplicate registration of openWebviewCommand
  console.log("Hello extension");

  // Tree data provider for draggable items
  class DraggableItem extends vscode.TreeItem {
    constructor(label: string) {
      super(label);
      this.contextValue = 'draggableItem';
      this.id = label;
      this.tooltip = `Send ${label} to Webview`;
      this.iconPath = new vscode.ThemeIcon('circle-filled');
      this.resourceUri = vscode.Uri.parse(`draggable:${label}`);
      this.command = {
        command: 'draggableItemsView.sendToWebview',
        title: 'Send to Webview',
        arguments: [label]
      };
    }
  }

  // Command to send item to Webview
  let lastPanel: vscode.WebviewPanel | undefined;
  const sendToWebviewCmd = vscode.commands.registerCommand('draggableItemsView.sendToWebview', (label: string) => {
    if (lastPanel) {
      lastPanel.webview.postMessage({ type: 'drop', label });
      lastPanel.reveal();
    } else {
      vscode.commands.executeCommand(openWebviewCommand).then(() => {
        setTimeout(() => {
          if (lastPanel) {
            lastPanel.webview.postMessage({ type: 'drop', label });
            lastPanel.reveal();
          }
        }, 500);
      });
    }
  });
  context.subscriptions.push(sendToWebviewCmd);

  class DraggableItemsProvider implements vscode.TreeDataProvider<DraggableItem>, vscode.TreeDragAndDropController<DraggableItem> {
    private items = ['Item 1', 'Item 2', 'Item 3'];
    readonly dragMimeTypes = ['application/vnd.code.tree.draggableItemsView'];
    readonly dropMimeTypes: string[] = [];
    getTreeItem(element: DraggableItem): vscode.TreeItem {
      return element;
    }
    getChildren(): DraggableItem[] {
      return this.items.map(label => new DraggableItem(label));
    }
    onDidChangeTreeData?: vscode.Event<void | DraggableItem | DraggableItem[]>;

    handleDrag(source: DraggableItem[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): void {
      dataTransfer.set('application/vnd.code.tree.draggableItemsView', new vscode.DataTransferItem(source[0].label));
    }
    handleDrop(target: DraggableItem | undefined, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): void {
      // No drop support in tree
    }
  }

  const treeDataProvider = new DraggableItemsProvider();
  const treeView = vscode.window.createTreeView('draggableItemsView', {
    treeDataProvider,
    dragAndDropController: treeDataProvider,
    showCollapseAll: false,
    canSelectMany: false
  });
  context.subscriptions.push(treeView);

  // Open Webview automatically when sidebar menu becomes visible
  treeView.onDidChangeVisibility(e => {
    if (e.visible) {
      vscode.commands.executeCommand(openWebviewCommand);
    }
  });

  // Register command to open Webview
  const disposable = vscode.commands.registerCommand(openWebviewCommand, () => {
    const panel = vscode.window.createWebviewPanel(
      'draggableWebview',
      'Drag & Drop Webview',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );
    panel.webview.html = getWebviewContent();
    lastPanel = panel;
    panel.onDidDispose(() => {
      lastPanel = undefined;
    }, null, context.subscriptions);
    // Listen for messages from extension (for initial drop)
    panel.webview.onDidReceiveMessage((message) => {
      // No-op, handled in webview
    });
  });
  context.subscriptions.push(disposable);
}