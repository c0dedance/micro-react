let nextWorkOfUnit = null
function workloop(deadline) {

  let shouldYield = false

  while (!shouldYield && nextWorkOfUnit) {
    // run task
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
    // update time
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workloop)
}

function createDom(type) {
  return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type)
}
function updateProps(dom, props) {
  Object.keys(props).forEach(key => {
    dom[key] = props[key]
  })
}

function initChild(fiber) {
  const { children } = fiber.props
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

/* 构建Fiber结构并render */
function performWorkOfUnit(fiber) {
  const { children, ...props } = fiber.props

  if (!fiber.dom) {
    // 1. 创建dom
    const dom = (fiber.dom = createDom(fiber.type))

    // 2. 更新props
    updateProps(dom, props)

    fiber.parent.dom.append(dom)
  }

  // 3. 建立Fiber连接
  initChild(fiber)

  // 4. 返回下一个工作单元
  if (fiber.child) {
    return fiber.child
  }
  if (fiber.sibling) {
    return fiber.sibling
  }
  // 返回undefined时表示处理完毕
  return fiber.parent?.sibling


}


function render(reactElement, container) {
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [reactElement]
    }
  }
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