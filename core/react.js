let nextWorkOfUnit = null
let wipRoot = null
let currentRoot = null
let wipFiber = null
let deletions = []
function workloop(deadline) {

  let shouldYield = false

  while (!shouldYield && nextWorkOfUnit) {
    // run task
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)

    // 优化 仅更新当前的组件树 减少不必要的更新
    if (wipRoot?.sibling === nextWorkOfUnit) {
      nextWorkOfUnit = null
    }

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
  deletions.forEach(commitDeletion)
  commitWork(wipRoot.child)
  commitEffectHooks()
  currentRoot = wipRoot
  wipRoot = null
  deletions = []
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

function commitDeletion(fiber) {
  if (fiber.dom) {
    let parentFiber = fiber.parent
    while (!parentFiber.dom) {
      parentFiber = parentFiber.parent
    }
    parentFiber.dom.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child)
  }

}

function commitEffectHooks() {
  run(wipFiber)

  // 递归函数
  function run(fiber) {
    if (!fiber) {
      return
    }
    //  commitEffect
    const oldEffectHooks = fiber.alternate?.effectHooks
    const curEffectHooks = fiber.effectHooks
    // init 都需要执行
    if (!fiber.alternate) {
      curEffectHooks?.forEach((effectHook) => {
        const cleanup = effectHook?.callback()
        // 存一下，下次更新的时候清除副作用
        effectHook.cleanup = cleanup
      })
    } else {
      // update
      curEffectHooks?.forEach((cureffectHook, index) => {
        const oldEffectHook = oldEffectHooks?.[index]
        if (!areHookInputsEqual(cureffectHook?.deps, oldEffectHook?.deps)) {
          // cleanup effect
          let cleanup = oldEffectHook.cleanup
          cleanup?.()
          // run effect
          cleanup = cureffectHook?.callback()
          cureffectHook.cleanup = cleanup
        }
      })
    }

    run(fiber.child)
    run(fiber.sibling)
  }
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
    // fix: oldFiber为undefined && child.type为undefined（child空值）时isSameType=ture的情况
    const isSameType = oldFiber && oldFiber?.type === child.type
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
      // 非空child才创建Fiber
      if (child) {
        newFiber = {
          type: child.type,
          props: child.props,
          parent: fiber,
          child: null,
          sibling: null,
          dom: null,
          alternate: null,
          effectTag: 'placement'
        }
      }
      if (oldFiber) {
        deletions.push(oldFiber)
      }
    }

    if (index === 0) {
      fiber.child = newFiber
    } else {
      preChild.sibling = newFiber
    }
    // fix: newFiber为空不记录，防止后续preChild.sibling取不到
    if (newFiber) {
      preChild = newFiber
    }
    // 另一个树alternate的指针同时移动
    oldFiber = oldFiber?.sibling
  })
  // fix: 检查是否有剩余的oldFiber
  while (oldFiber) {
    deletions.push(oldFiber)
    oldFiber = oldFiber.sibling
  }
}

function updateFunctionComponent(fiber) {
  // 在执行FC前存一下fiber
  wipFiber = fiber
  // 初始化 stateHooks
  stateHooks = []
  stateHookIndex = 0
  // 初始化 effectHooks 
  effectHooks = []
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
  const currentFiber = wipFiber

  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber
    }
    nextWorkOfUnit = wipRoot
  }
}

let stateHooks = []
let stateHookIndex = 0
function useState(initialState) {
  const currentFiber = wipFiber
  const oldStateHook = currentFiber.alternate?.stateHooks[stateHookIndex++]
  const stateHook = {
    state: oldStateHook ? oldStateHook.state : initialState,
    queue: oldStateHook ? oldStateHook.queue : []
  }
  // update state
  stateHook.queue.forEach(action => {
    stateHook.state = action(stateHook.state)
  })
  stateHook.queue = []

  currentFiber.stateHooks = stateHooks
  stateHooks.push(stateHook)

  function setState(action) {
    // 优化 更新前后state相同，不更新
    const eagerState = typeof action === "function" ? action(stateHook.state) : action
    if (eagerState === stateHook.state) {
      return
    }

    // 获取新的state
    const actionFn = typeof action === "function" ? action : () => action
    // 收集action
    stateHook.queue.push(actionFn)
    // update fiber
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber
    }
    nextWorkOfUnit = wipRoot
  }

  return [stateHook.state, setState]
}
let effectHooks = []
function useEffect(callback, deps) {
  // effectHooks挂到fiber上
  wipFiber.effectHooks = effectHooks

  const effectHook = {
    callback,
    deps,
    cleanup: null
  }
  // 收集 effect
  effectHooks.push(effectHook)
}

function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) {
    return false;
  }
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}

export function render(reactElement, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [reactElement]
    }
  }
  nextWorkOfUnit = wipRoot
}

requestIdleCallback(workloop)

const createTextElement = (text) => ({
  type: 'TEXT_ELEMENT',
  props: {
    nodeValue: text,
    children: []
  },
})

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        const isTextNode = ["string", "number"].includes(typeof child)
        return isTextNode ? createTextElement(child) : child
      })
        .filter(Boolean) // fix: 首个孩子为空构建Fiber、sibling的case
    }
  }
}

export default {
  createElement,
  useState,
  useEffect,
}