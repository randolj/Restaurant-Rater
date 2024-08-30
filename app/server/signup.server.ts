import { LoaderFunction, ActionFunction, json } from "@remix-run/node";
import { authenticator } from "~/utils/auth.server";
import { createUser } from "~/utils/user.server";
import { validateEmail, validatePassword } from "~/utils/validators";

export const loader: LoaderFunction = async ({ request }) => {
    const user = await authenticator.isAuthenticated(request, {
        successRedirect: "/",
    });
    return { user };
};

export const action: ActionFunction = async ({ request }) => {
    const requestClone = request.clone();
    const formData = await requestClone.formData();
    const action = formData.get("_action") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (!email || !password || !name || !username) {
        return json(
            { error: `All fields are required`, form: action },
            { status: 400 }
        );
    }

    const emailError = validateEmail(email);
    if (emailError) {
        return json({ error: emailError, form: action }, { status: 400 });
    }

    // const passwordError = validatePassword(password);
    // if (passwordError) {
    //     return json({ error: passwordError, form: action }, { status: 400 });
    // }

    const result = await createUser({ username, email, password, name });

    if (!result.success) {
        return json({ error: result.message }, { status: 400 });
    }

    return await authenticator.authenticate("form", request, {
        successRedirect: "/",
        failureRedirect: "/signup",
        context: { formData: formData },
    });
};
