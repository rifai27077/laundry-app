"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";  // ⬅ ICON LUCIDE

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setErrorMsg("Username atau password salah");
      setLoading(false);
      return;
    }

    if (username === "admin") router.push("/admin/dashboard");
    if (username === "kasir") router.push("/dashboard/kasir");
    if (username === "owner") router.push("/dashboard/owner");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-500 to-blue-700 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Laundry App</h1>
          <p className="text-gray-500 mt-1 text-sm">Silakan login untuk melanjutkan</p>
        </div>

        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-600 text-sm p-3 rounded mb-4 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* USERNAME */}
          <div className="mb-5">
            <label className="block font-semibold text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 text-gray-500 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 text-gray-500 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {/* SHOW / HIDE BUTTON (LUCIDE ICON) */}
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-3 rounded-lg text-lg font-semibold transition 
              ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          © {new Date().getFullYear()} Laundry App — All rights reserved
        </p>
      </div>
    </div>
  );
}
