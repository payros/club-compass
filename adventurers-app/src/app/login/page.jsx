import { Suspense } from "react";
import View from "./view";

export const metadata = { title: "Sign In" };

const LoginPage = () => (
  <Suspense>
    <View />
  </Suspense>
);
export default LoginPage;
