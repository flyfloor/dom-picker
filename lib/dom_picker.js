"use strict";

var MASK_CLASS_NAME = 'pixel-mask-layer';
var __instance = null;
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

var Picker = {
  init: function init(_ref) {
    var onPathChange = _ref.onPathChange;
    __instance = Picker;
    Picker.onPathChange = onPathChange;
  },
  on: function on() {
    if (!__instance) {
      throw Error('Picker need init');
    }

    document.documentElement.style.webkitTapHighlightColor = 'transparent';
    document.addEventListener('click', onClick);
    document.addEventListener('mousemove', toggleMask);
  },
  off: function off() {
    if (!__instance) {
      throw Error('Picker need init');
    }

    document.documentElement.style.webkitTapHighlightColor = '';
    document.removeEventListener('click', onClick);
    document.removeEventListener('mousemove', toggleMask);
  } // 切换选中蒙层

};

function toggleMask(event) {
  event.stopPropagation();
  var dom = document.querySelectorAll(".".concat(MASK_CLASS_NAME));

  if (dom && dom[0]) {
    dom[0].style.outline = '';
    dom[0].classList.remove(MASK_CLASS_NAME);
  }

  event.target.classList.add(MASK_CLASS_NAME);
  event.target.style.outline = '2px solid rgba(180, 180, 180, .7)';
} // 根据dom id、class、tag 生成 dom 节点的 path


function computeDomPath(node) {
  if (!node) {
    throw Error('dom element should not be empty');
  }

  if (node.id) {
    return "#".concat(node.id);
  }

  var classNames = Array.prototype.filter.call(node.classList, function (c) {
    return c !== 'pixel-mask-layer';
  });
  var path = node.tagName.toLowerCase();

  if (classNames && classNames.length) {
    path = "".concat(path, ".").concat(classNames.join('.'));
  }

  var parentElement = node.parentElement;

  if (parentElement) {
    var _parentElement$queryS = parentElement.querySelectorAll(path),
        length = _parentElement$queryS.length;

    if (length === 1) return path;
    var index = Array.prototype.indexOf.call(parentElement.children, node);
    return "".concat(path, ":nth-child(").concat(index + 1, ")");
  }

  return path;
} // 遍历获得 dom 的path，保证 path 的全局唯一


function traverseNodePath(node) {
  var childPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  if (!childPath && node.id) {
    return "#".concat(node.id);
  } // unique return


  var domPath = computeDomPath(node);

  if (childPath) {
    domPath = "".concat(domPath, ">").concat(childPath);
  }

  var domLength = document.querySelectorAll(domPath).length;

  if (domLength === 1) {
    return domPath;
  }

  if (node.parentElement) {
    return traverseNodePath(node.parentElement, domPath);
  }

  return domPath;
} // 元素点击获得 dom 的 可标识的 path


function onClick(event) {
  event.preventDefault();

  if (typeof Picker.onPathChange === 'function') {
    Picker.onPathChange(traverseNodePath(event.target));
  }
}

module.exports = Picker;