import { LoaderFunction, ActionFunction, json } from "@remix-run/node";
import { authenticator } from "~/utils/auth.server";
import { authUser } from "~/utils/user.server";

export const loader: LoaderFunction = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request, {
        successRedirect: "/home",
    });
    return user;
};

export const action: ActionFunction = async ({ request }) => {
    const requestClone = request.clone();
    const formData = await requestClone.formData();

    const emailOrUsername = formData.get("emailOrUsername") as string;
    const password = formData.get("password") as string;

    if (!emailOrUsername || !password) {
        return json(
            { error: `All fields are required`, form: action },
            { status: 400 }
        );
    }

    const result = await authUser({ emailOrUsername, password });

    if (!result.success) {
        return json({ error: result.message }, { status: 400 });
    }

    return await authenticator.authenticate("form", request, {
        successRedirect: "/",
        failureRedirect: "/login",
        context: { formData: formData },
    });
};