let nextWorkOfUnit = null
let root = null
function workloop(deadline) {

  let shouldYield = false

  while (!shouldYield && nextWorkOfUnit) {
    // run task
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
    // update time
    shouldYield = deadline.timeRemaining() < 1
  }
  // 完成 fiber 树构建
  if (!nextWorkOfUnit && root) {
    commitRoot()
  }
  requestIdleCallback(workloop)
}
function commitRoot() {
  commitWork(root.child)
  root = null
}
/* 统一提交 */
function commitWork(fiber) {
  if (!fiber) {
    return
  }
  // 更新dom
  if (typeof fiber.type !== "function") {
    let parentFiber = fiber.parent
    while (!parentFiber.dom) {
      parentFiber = parentFiber.parent
    }
    parentFiber.dom.append(fiber.dom)
  }
  // 递归更新
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function createDom(type) {
  return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type)
}
function updateProps(dom, props) {
  Object.keys(props).forEach(key => {
    dom[key] = props[key]
  })
}

function initChild(fiber, children) {
  let preChild
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      child: null,
      sibling: null,
      dom: null,
    }
    if (index === 0) {
      fiber.child = newFiber
    } else {
      preChild.sibling = newFiber
    }
    preChild = newFiber
  })
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]
  // 3. 建立Fiber连接
  initChild(fiber, children)
}

function updateHostComponent(fiber) {
  const { children, ...props } = fiber.props

  if (!fiber.dom) {
    // 1. 创建dom
    const dom = (fiber.dom = createDom(fiber.type))
    // 2. 更新props
    updateProps(dom, props)
  }
  // 3. 建立Fiber连接
  initChild(fiber, children)
}

/* 构建Fiber结构并render */
function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === "function"

  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }

  // 4. 返回下一个工作单元
  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
  return null

}

function render(reactElement, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [reactElement]
    }
  }
  root = nextWorkOfUnit
}

requestIdleCallback(workloop)

const ReactDOM = {
  createRoot(container) {
    return {
      render(reactElement) {
        render(reactElement, container)
      }
    }
  }
}

export default ReactDOM