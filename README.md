# First Ink

Created from a Next.js TypeScript [starter](https://github.com/redimpulz/nextjs-typescript-starter).

## Tech stack

- Next.js
- TypeScript
- Supabase
- Vercel

## Getting started

1. Install dependencies:

`yarn`

2. Start the development server:

`yarn dev`

3. Set up environment variables.

TODO: Add Vercel Instructions

- Rename `.env.template` to `.env.local` in the root directory
- You can resync env from vercel by running `vc env pull .env.local`
- Add the Supabase environment variable values from the [app page](https://app.supabase.io/) under `Settings` -> `API`.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. Go to `localhost:3000`

## How the recruit system works

### User signs up with a referral code

1. User goes to url like `verifiedink.us/signup?referralCode=6tDk3Eb`

2. User presses sign up using email/social

3. `signup.tsx` reads query and sets localStorage items `sign_up = true` and `referral_code = 6tDk3Eb`

4. User is redirected back to website where `userStore.initUser` is called.

5. `initUser` checks for `sign_up` local storage item

6. If exists, call `userStore.initSignUp`

7. `initSignUp` checks `user_details` for who owns the used `referral_code`, and updates that user's `total_referred_users` count in db.

8. Create a new `user_details` db object on current user with a new `generated_referral_code` with `nanoid` and the referring user's id

9. Clear localstorage and continue.

### User signs up without a referral code

1. Same as above except in `initSignUp` skip the part about the referring user db update.
