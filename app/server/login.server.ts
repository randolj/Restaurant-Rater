import { LoaderFunction, ActionFunction, json } from "@remix-run/node";
import { authenticator } from "~/utils/auth.server";
import { authUser } from "~/utils/user.server";

export const loader: LoaderFunction = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request, {
        successRedirect: "/",
    });
    return user;
};

export const action: ActionFunction = async ({ request }) => {
    const requestClone = request.clone();
    const formData = await requestClone.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return json(
            { error: `All fields are required`, form: action },
            { status: 400 }
        );
    }

    const result = await authUser({ email, password });


    if (!result.success) {
        return json({ error: result.message }, { status: 400 });
    }

    return await authenticator.authenticate("form", request, {
        successRedirect: "/",
        failureRedirect: "/login",
        context: { formData: formData },
    });
};