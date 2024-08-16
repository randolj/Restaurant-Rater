import type { MetaFunction } from "@remix-run/node";
import { ActionFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";

import { authenticator } from "~/utils/auth.server";

// TODO: Create github repo

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const action = form.get("action")

  switch (action) {
    case "logout": {
      return await authenticator.logout(request, {redirectTo: "/login"})
    }
  }
}

export default function Index() {
  return (
    <div className="font-sans p-4">
      <h1 className="text-red-600">Welcome to fullstack remix app</h1>
      <Form method="post">
        <button
          type="submit"
          name="action"
          value="logout"
          className="text-red-500 py-1 border px-3 text-sm rounded-md font-semibold"
        >
          Logout
        </button>
      </Form>
    </div>
  );
}
