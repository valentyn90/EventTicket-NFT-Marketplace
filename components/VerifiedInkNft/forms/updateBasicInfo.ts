import userStore from "@/mobx/UserStore";
import AsyncMethodReturn from "@/types/AsyncMethodReturn";
import cookieCutter from "cookie-cutter";

async function updateBasicInfo(e: React.FormEvent): Promise<AsyncMethodReturn> {
  e.preventDefault();

  const data = new FormData(e.target as HTMLFormElement);

  const temp_user_id = cookieCutter.get("temp_user_id");

  if (temp_user_id) {
    data.set("temp_user_id", temp_user_id);
  }

  const json_data = JSON.stringify(Object.fromEntries(data));

  const res = await fetch(`/api/create/basic-info`, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: json_data,
  });

  const resj = await res.json();

  if (res.ok) {
    if (!temp_user_id && resj.temp_user_id) {
      cookieCutter.set("temp_user_id", resj.temp_user_id, {
        path: "/",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      });
    }

    console.log(resj);

    if (!userStore.nft) {
      if (resj.nft) {
        userStore.nft = resj.nft;
      }
    }

    if (resj.temp_user_id) {
      userStore.temp_user_id = resj.temp_user_id;
    }

    // move to next step
    userStore.ui.nextStep();
  }
  return {
    success: resj.success,
    message: resj.message,
  };
}

export default updateBasicInfo;
