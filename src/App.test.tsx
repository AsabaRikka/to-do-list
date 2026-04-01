import { beforeEach, describe, expect, it } from 'vitest'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App'
import { useTodoStore } from './store/todoStore'
import { DEFAULT_FILTER } from './types'

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear()
    useTodoStore.setState({ tasks: [], filter: DEFAULT_FILTER })
    await useTodoStore.persist.rehydrate()
  })

  it('adds a task and updates stats', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText(/任务名称/), '测试任务')
    await user.type(screen.getByLabelText('备注'), '  第一行\n第二行  ')
    await user.click(screen.getByRole('button', { name: '添加' }))

    expect(screen.getByText('测试任务')).toBeInTheDocument()
    expect(screen.getByTestId('stats-total')).toHaveTextContent('1')

    await user.click(screen.getByRole('button', { name: '展开备注' }))
    expect(screen.getByLabelText('备注内容')).toHaveValue('第一行\n第二行')
  })
})
