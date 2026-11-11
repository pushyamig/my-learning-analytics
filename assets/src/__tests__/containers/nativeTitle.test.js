/* global it, expect, jest, beforeAll */

import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { TextDecoder, TextEncoder } from 'node:util'

globalThis.TextDecoder = TextDecoder
globalThis.TextEncoder = TextEncoder

let MemoryRouter
let App

beforeAll(async () => {
  const globalsElement = document.createElement('script')
  globalsElement.id = 'myla_globals'
  globalsElement.type = 'application/json'
  globalsElement.textContent = JSON.stringify({
    survey_link: { text: '', url: '' },
    view_help_urls: {},
    user_courses_info: []
  })
  document.body.appendChild(globalsElement)
  ;({ MemoryRouter } = await import('react-router-dom'))
  App = (await import('../../containers/App')).default
})

const user = {
  isLoggedIn: true,
  loginURL: '',
  relatedCourses: [],
  admin: true,
  initials: 'T'
}

it('sets one native document title for the course list, course, and views', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      name: 'Synthetic course',
      course_data_loaded: 0,
      course_view_options: { ra: true, ap: true, gd: true }
    })
  })

  async function renderTitle (pathname) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[pathname]}>
          <App user={user} />
        </MemoryRouter>
      )
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    const result = {
      title: document.title,
      count: document.head.querySelectorAll('title').length
    }
    await act(async () => root.unmount())
    container.remove()
    return result
  }

  try {
    const cases = [
      ['/courses', 'Courses | My Learning Analytics'],
      ['/courses/1', 'Synthetic course | My Learning Analytics'],
      ['/courses/1/grades', 'Grade Distribution | My Learning Analytics'],
      ['/courses/1/assignments', 'Assignment Planning | My Learning Analytics'],
      ['/courses/1/resources', 'Resources Accessed | My Learning Analytics']
    ]

    for (const [pathname, expectedTitle] of cases) {
      await expect(renderTitle(pathname)).resolves.toEqual({ title: expectedTitle, count: 1 })
    }
  } finally {
    globalThis.fetch = originalFetch
  }
})
