import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Регистрируем команду, которая появится в палитре команд (Ctrl+Shift+P)
    let disposable = vscode.commands.registerCommand('codewrapper.wrap', async () => {
        const editor = vscode.window.activeTextEditor;
        
        // Если редактор не открыт, выходим
        if (!editor) {
            vscode.window.showErrorMessage('Откройте файл с кодом!');
            return;
        }

        // Получаем выделенный пользователем текст
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (!selectedText) {
            vscode.window.showInformationMessage('Выделите код, который нужно обернуть.');
            return;
        }

        // Спрашиваем у пользователя условие (например, "x > 0")
        const condition = await vscode.window.showInputBox({
            prompt: 'Введите условие для if',
            placeHolder: 'например: x > 0'
        });

        if (!condition){
			return; 
		}// Пользователь нажал Esc

        // Формируем новый код
        // (Для простоты берем стандартный отступ, но в идеале его можно вычислять)
        const newCode = `if (${condition}) {\n${selectedText}\n}`;

        // Заменяем выделенный текст на новый
        await editor.edit(editBuilder => {
            editBuilder.replace(selection, newCode);
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}