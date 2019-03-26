const MASK_CLASS_NAME = 'pixel-mask-layer'
let __instance = null

/*
* Picker，用于获取页面元素的path
* 点击元素，获取能够标识dom在页面的对应path
* @{functions}
*   Picker.init({
*     onPathChange, // path change will trigger function call
*   })
* 
*   Picker.on() // picker on
*   Picker.off() // picker off
*
*/

const Picker = {
  init: ({ onPathChange }) => {
    __instance = Picker
    Picker.onPathChange = onPathChange
  },
  on: () => {
    if (!__instance) {
      throw Error('Picker need init')
    }
    document.documentElement.style.webkitTapHighlightColor = 'transparent'
    document.addEventListener('click', onClick)
    document.addEventListener('mousemove', toggleMask)
  },
  off: () => {
    if (!__instance) {
      throw Error('Picker need init')
    }
    document.documentElement.style.webkitTapHighlightColor = ''
    document.removeEventListener('click', onClick)
    document.removeEventListener('mousemove', toggleMask)
  }
}

// 切换选中蒙层
function toggleMask (event) {
  event.stopPropagation()
  const dom = document.querySelectorAll(`.${MASK_CLASS_NAME}`)
  if (dom && dom[0]) {
    dom[0].style.outline = ''
    dom[0].classList.remove(MASK_CLASS_NAME)
  }
  event.target.classList.add(MASK_CLASS_NAME)
  event.target.style.outline = '2px solid rgba(180, 180, 180, .7)'
}

// 根据dom id、class、tag 生成 dom 节点的 path
function computeDomPath (node) {
  if (!node) {
    throw Error('dom element should not be empty')
  }

  if (node.id) {
    return `#${node.id}`
  }

  const classNames = Array.prototype.filter.call(node.classList, c => c !== 'pixel-mask-layer')
  let path = node.tagName.toLowerCase()
  if (classNames && classNames.length) {
    path = `${path}.${classNames.join('.')}`
  }
  
  const { parentElement } = node

  if (parentElement) {
    const { length } = parentElement.querySelectorAll(path)
    if (length === 1) return path
    const index = Array.prototype.indexOf.call(parentElement.children, node)
    return `${path}:nth-child(${index + 1})`
  }
  return path
}

// 遍历获得 dom 的path，保证 path 的全局唯一
function traverseNodePath (node, childPath = '') {
  if (!childPath && node.id) {
    return `#${node.id}`
  }

  // unique return
  let domPath = computeDomPath(node)
  if (childPath) {
    domPath = `${domPath}>${childPath}`
  }
  const domLength = document.querySelectorAll(domPath).length
  if (domLength === 1) {
    return domPath
  }

  if (node.parentElement) {
    return traverseNodePath(node.parentElement, domPath)
  }
  return domPath
}

// 元素点击获得 dom 的 可标识的 path
function onClick (event) {
  event.preventDefault()
  if (typeof Picker.onPathChange === 'function') {
    Picker.onPathChange(traverseNodePath(event.target))
  }
}

module.exports = Picker
