import React, { useState } from "react";
import { Link, useActionData } from "@remix-run/react";
import { MetaFunction } from "@remix-run/node";

import { Layout } from "../components/layout";
import { Textfield } from "../components/textField";

import { loader, action } from "../server/signup.server";

export const meta: MetaFunction = () => {
  return [{ title: "Restaurant Rater SignUp" }];
};

interface ActionData {
  fields?: {
    email?: string;
    password?: string;
    name?: string;
  };
  error?: string;
}

export default function SignUp() {
  const actionData = useActionData<ActionData>();
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || "",
    password: actionData?.fields?.password || "",
    name: actionData?.fields?.name || "",
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    event.preventDefault();
    setFormData((form) => ({ ...form, [field]: event.target.value }));
  };

  return (
    <Layout>
      <div className="h-full justify-center bg-primary items-center flex flex-col gap-y-5">
        <form method="POST" className="rounded-lg bg-white p-5 w-96">
          <h2 className="text-3xl font-bold text-gray-400 mb-2 flex flex-col items-center">
            Create an account
          </h2>
          {actionData?.error && (
            <p className="text-left ml-1 text-red-500">{actionData.error}</p>
          )}
          <Textfield
            htmlFor="name"
            type="name"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => handleInputChange(e, "name")}
          />
          <Textfield
            htmlFor="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => handleInputChange(e, "email")}
          />
          <Textfield
            htmlFor="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleInputChange(e, "password")}
          />
          <div className="w-full text-center mt-2">
            <button
              type="submit"
              name="_action"
              value="Sign In"
              className="w-full rounded-xl bg-primary px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-sky-600"
            >
              Create an account
            </button>
          </div>
        </form>
        <p className="text-white">
          Already have an account?
          <Link to="/login">
            <span className="text-white px-2 underline">Sign In</span>
          </Link>
        </p>
      </div>
    </Layout>
  );
}

export { loader, action };
