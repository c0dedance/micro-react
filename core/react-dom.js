function render(reactElement, container) {
  const el = reactElement.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(reactElement.type)
  const { children, ...props } = reactElement.props
  Object.keys(props).forEach(key => {
    el[key] = props[key]
  })

  // 递归处理
  children.forEach(child => render(child, el))

  container.append(el)
}

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