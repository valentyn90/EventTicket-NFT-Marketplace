import { getUserDetailsByEmail } from "@/supabase/userDetails";

export const createUser = async (email: string) => {
  const createRes = await fetch(`/api/admin/create-user`, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify({
      email,
    }),
  })
    .then((res) => res.json())
    .catch((err) => {
      return {
        user: null,
        error: true,
        err: err,
      };
    });

  if (createRes.error || !createRes.user) {
    return {
      status: false,
      msg: "failed",
    };
  } else {
    console.log("the user is", createRes.user);
    return createRes.user;
  }
};

export const verifyUserExist = async (email: string) => {
  const { data: userData, error: userError } = await getUserDetailsByEmail(
    email
  );
  if (userData) {
    return userData;
  } else {
    return await createUser(email);
  }
};
