import React, { useState } from "react";
import { Layout } from "../components/layout";
import { Textfield } from "~/components/textField";
import { Link, useActionData } from "@remix-run/react";
import { MetaFunction } from "@remix-run/node";
import { loader, action } from "../server/login.server";

export const meta: MetaFunction = () => {
  return [{ title: "Restaurant Rater Login" }];
};

interface ActionData {
  fields?: {
    emailOrUsername?: string;
    password?: string;
  };
  error?: string;
}

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [formData, setFormData] = useState({
    emailOrUsername: actionData?.fields?.emailOrUsername || "",
    password: actionData?.fields?.password || "",
  });

  // Updates the form data when an input changes
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form) => ({ ...form, [field]: event.target.value }));
  };

  return (
    <Layout>
      <div className="h-full justify-center bg-primary items-center flex flex-col gap-y-5">
        <form method="POST" className="rounded-lg bg-white p-6 w-96">
          <h2 className="text-3xl font-bold text-gray-400 mb-5 flex flex-col items-center">
            Login
          </h2>
          {actionData?.error && (
            <p className="text-left ml-1 text-red-500 text-sm">
              {actionData.error}
            </p>
          )}
          <Textfield
            htmlFor="emailOrUsername"
            placeholder="Email or Username"
            value={formData.emailOrUsername}
            onChange={(e) => handleInputChange(e, "emailOrUsername")}
          />
          <Textfield
            htmlFor="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleInputChange(e, "password")}
          />
          <div className="w-full text-center mt-5">
            <button
              type="submit"
              name="_action"
              value="Sign In"
              className="w-full rounded-xl mt-2 bg-primary px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-gray-500"
            >
              Login
            </button>
          </div>
        </form>
        <p className="text-white">
          Don't have an account?{" "}
          <Link to="/signup">
            <span className="text-white px-2 underline">Create an account</span>
          </Link>
        </p>
      </div>
    </Layout>
  );
}

export { loader, action };
