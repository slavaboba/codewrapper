import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('code-wrapper.wrapCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor){
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        if (!selectedText) {
            vscode.window.showInformationMessage('Сначала выделите код!');
            return;
        }

        // 1. Спрашиваем, в какую конструкцию обернуть
        const choice = await vscode.window.showQuickPick(['if', 'for', 'while'], {
            placeHolder: 'Выберите конструкцию для обертывания'
        });
        if (!choice){
            return;
        }

        // 2. Спрашиваем условие/заголовок цикла
        let promptText = '';
        let defaultVal = '';
        if (choice === 'if') {
            promptText = 'Введите условие для if';
            defaultVal = 'condition';
        } else if (choice === 'for') {
            promptText = 'Введите заголовок для for';
            defaultVal = 'let i = 0; i < n; i++';
        } else if (choice === 'while') {
            promptText = 'Введите условие для while';
            defaultVal = 'condition';
        }

        const param = await vscode.window.showInputBox({
            prompt: promptText,
            value: defaultVal
        });
        if (!param){
            return;
        }

        // 3. Анализ отступов (умная логика)
        // Определяем, сколько табов/пробелов стоит перед первой строкой выделения
        const line = editor.document.lineAt(selection.start.line);
        const lineText = line.text;
        
        // Ищем отступ в начале строки (табы или пробелы)
        const indentMatch = lineText.match(/^[\t ]*/);
        const baseIndent = indentMatch ? indentMatch[0] : '';
        
        // Определяем символ для отступа (таб или пробелы)
        // Если в файле используются пробелы, берем настройки редактора
        const useSpaces = editor.options.insertSpaces as boolean;
        const tabSize = editor.options.tabSize as number;
        const indentChar = useSpaces ? ' '.repeat(tabSize) : '\t';

        // Добавляем один уровень отступа к каждой строке выделенного текста
        // Разбиваем текст на строки и добавляем отступ
        const lines = selectedText.split('\n');
        const indentedLines = lines.map((l, index) => {
            // Если это первая строка, мы её не трогаем (она уже имеет отступ в редакторе),
            // но так как мы заменяем выделение, нам нужно применить отступ ко всем строкам.
            // Если строка пустая, не добавляем отступ
            return l.trim() === '' ? '' : indentChar + l;
        });

        // 4. Формируем итоговый код
        let newCode = `${choice} (${param}) {\n`;
        newCode += indentedLines.join('\n') + '\n';
        newCode += baseIndent + '}'; // Закрывающая скобка на уровне базового отступа

        // 5. Заменяем выделенный текст
        await editor.edit(editBuilder => {
            // Заменяем только выделенный фрагмент
            editBuilder.replace(selection, newCode);
        });

        // Форматируем документ, чтобы VS Code сам поправил отступы, если нужно
        await vscode.commands.executeCommand('editor.action.formatDocument');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}