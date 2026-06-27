import { Button, Space } from "antd";
import { GithubOutlined, GoogleOutlined, LogoutOutlined } from "@ant-design/icons";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../../lib/firebase";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

export function AuthButtons() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const storeUser = useMutation(api.users.storeUser);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async (provider: typeof googleProvider | typeof githubProvider) => {
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, provider);
      // Panggil sinkronisasi ke Convex
      await storeUser();
    } catch (error) {
      console.error("Failed to sign in", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = () => {
    auth.signOut();
  };

  if (isLoading) {
    return <Button loading>Memuat...</Button>;
  }

  if (isAuthenticated) {
    return (
      <Button icon={<LogoutOutlined />} onClick={handleSignOut} danger>
        Keluar
      </Button>
    );
  }

  return (
    <Space>
      <Button
        icon={<GoogleOutlined />}
        onClick={() => handleSignIn(googleProvider)}
        loading={isSigningIn}
      >
        Google
      </Button>
      <Button
        icon={<GithubOutlined />}
        onClick={() => handleSignIn(githubProvider)}
        loading={isSigningIn}
      >
        GitHub
      </Button>
    </Space>
  );
}
