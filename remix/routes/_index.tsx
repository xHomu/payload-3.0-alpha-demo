import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
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
  );
}
