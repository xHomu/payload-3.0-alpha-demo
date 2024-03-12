import type { MetaFunction, LoaderFunctionArgs } from '@remix-run/node'

import { useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/server-runtime'

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }]
}
export const loader = async ({ context: { payload } }: LoaderFunctionArgs) => {
  const users = await payload.find({
    collection: 'users',
  })

  return json({ userCount: users.totalDocs }, { status: 200 })
}

export default function Index() {
  const { userCount } = useLoaderData<typeof loader>()
  console.log(userCount)
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.8' }}>
      <h1>Welcome to Remix</h1>
      <ul>
        <li>
          <a href="/admin">Payload Next Admin</a>
        </li>
        <li>
          <a href="/api/users">Payload Rest API</a>
        </li>
        <li>
          <a href="/api/graphql-playground">Payload GraphQL</a>
        </li>
      </ul>
    </div>
  )
}
