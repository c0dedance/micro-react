import { describe, expect, test } from 'vitest'
import React from '../core/react'
describe('createElement', () => {
  test('create element with no props', () => {
    const el = React.createElement('div', null, 'Hello, mini react!')
    expect(el).toMatchInlineSnapshot(`
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "Hello, mini react!",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
        },
        "type": "div",
      }
    `)
  })
  test('create element with props', () => {
    const el = React.createElement('div', { id: 'app' }, 'Hello, mini react!')
    expect(el).toMatchInlineSnapshot(`
      {
        "props": {
          "children": [
            {
              "props": {
                "children": [],
                "nodeValue": "Hello, mini react!",
              },
              "type": "TEXT_ELEMENT",
            },
          ],
          "id": "app",
        },
        "type": "div",
      }
    `)
  })
})