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
}