let nextWorkOfUnit = null
let wipRoot = null
let currentRoot = null
function workloop(deadline) {

  let shouldYield = false

  while (!shouldYield && nextWorkOfUnit) {
    // run task
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
    // update time
    shouldYield = deadline.timeRemaining() < 1
  }
  // 完成 fiber 树构建
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot()
  }
  requestIdleCallback(workloop)
}
function commitRoot() {
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
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
    if (fiber.effectTag === "update") {
      updateProps(fiber.dom, fiber.props, fiber.alternate.props)
    } else if (fiber.effectTag === "placement") {
      if (fiber.dom) {
        parentFiber.dom.append(fiber.dom)
      }
    }
  }
  // 递归更新
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function createDom(type) {
  return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type)
}
function updateProps(dom, nextProps, preProps) {
  // 1. 旧的props有，新的props没有，删除
  Object.keys(preProps).forEach(key => {
    if (key === "children") {
      return
    }
    if (!(key in nextProps)) {
      // 删除属性和方法
      if (key.startsWith("on")) {
        // onClick -> click
        const event = key.slice(2).toLowerCase()
        dom.removeEventListener(event, preProps[key])
      } else {
        // dom[key] = null
        dom.removeAttribute(key)
      }
    }
  })
  // 2. 新的props有，旧的props没有，添加
  // 3. 新的props有，旧的props有，更新
  // 实际上情况3覆盖了情况2，旧的没有则为undefined，也就是和新的不相等，直接赋值覆盖
  Object.keys(nextProps).forEach(key => {
    if (key === "children") {
      return
    }
    if (nextProps[key] !== preProps[key]) {
      if (key.startsWith("on")) {
        // onClick -> click
        const event = key.slice(2).toLowerCase()
        dom.removeEventListener(event, preProps[key])
        dom.addEventListener(event, nextProps[key])
      } else {
        dom[key] = nextProps[key]
      }
    }
  })
}

function reconcileChildren(fiber, children) {
  // 获取child/sibling的alternate，不是fiber的alternate 
  let oldFiber = fiber.alternate?.child
  let preChild
  children.forEach((child, index) => {

    const isSameType = oldFiber?.type === child.type
    let newFiber
    if (isSameType) {
      // update
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        child: null,
        sibling: null,
        dom: oldFiber.dom,
        alternate: oldFiber,
        effectTag: 'update'
      }
    } else {
      // create
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        child: null,
        sibling: null,
        dom: null,
        alternate: oldFiber,
        effectTag: 'placement'
      }
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      preChild.sibling = newFiber
    }
    preChild = newFiber
    // 另一个树alternate的指针同时移动
    oldFiber = oldFiber?.sibling
  })
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)]
  // 3. 建立Fiber连接
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
  const { children, ...props } = fiber.props

  if (!fiber.dom) {
    // 1. 创建dom
    const dom = (fiber.dom = createDom(fiber.type))
    // 2. 更新props
    updateProps(dom, props, {})
  }
  // 3. 建立Fiber连接
  reconcileChildren(fiber, children)
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

function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot
  }
  nextWorkOfUnit = wipRoot
}

function render(reactElement, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [reactElement]
    }
  }
  nextWorkOfUnit = wipRoot
}

requestIdleCallback(workloop)

const ReactDOM = {
  createRoot(container) {
    return {
      render(reactElement) {
        render(reactElement, container)
      }
    }
  },
  update
}

export default ReactDOM