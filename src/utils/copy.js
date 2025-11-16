import { ElMessage } from 'element-plus'

export default async function copy(text, showTxt) {
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(text)
            console.log('Text copied to clipboard (web)')
        } catch (err) {
            console.error('Failed to copy text (web): ', err)
        }
    } else {
        copyToClipboardFallback(text)
    }
    ElMessage({
        type: 'success',
        message: showTxt || text,
    })
}

function copyToClipboardFallback(text) {
    // 创建一个临时的textarea元素
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'

    // 将textarea添加到文档中并设置焦点
    document.body.appendChild(textarea)
    textarea.focus()

    // 尝试复制文本（这可能不会在所有浏览器中工作）
    try {
        // 模拟Ctrl+C或Cmd+C事件
        const success = document.execCommand('copy')
        console.log('Copying text command was ' + (success ? 'successful' : 'unsuccessful'))
    } catch (err) {
        console.error('Failed to copy text: ', err)
    }

    // 清理
    document.body.removeChild(textarea)
}
