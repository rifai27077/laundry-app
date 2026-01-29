"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
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

    if (res?.ok) {
      const session = await fetch("/api/auth/session").then(r => r.json());
      const role = session.user.role;

      if (role === "admin") router.push("/admin/dashboard");
      else if (role === "kasir") router.push("/kasir/dashboard");
      else if (role === "owner") router.push("/owner/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex text-gray-900 bg-gray-50 font-sans">
      {/* LEFT SIDE: VISUAL (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-blue-600 overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-blue-900/60 to-transparent"></div>
        <Image
          src="/img/login-bg.png"
          alt="Modern Laundry Service"
          fill
          className="object-cover transition-transform duration-10000 hover:scale-110"
          priority
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 text-white">
          <h2 className="text-5xl font-extrabold mb-4 drop-shadow-lg leading-tight">
            Elevate Your Laundry <br /> Experience.
          </h2>
          <p className="text-xl text-blue-50/90 max-w-md drop-shadow-md">
            Manage your outlets, transactions, and customers with ease in one powerful dashboard.
          </p>
          <div className="mt-12 flex gap-4">
            <div className="h-1 w-24 bg-white/30 rounded-full">
              <div className="h-full w-1/3 bg-white rounded-full"></div>
            </div>
            <div className="h-1 w-12 bg-white/20 rounded-full"></div>
            <div className="h-1 w-12 bg-white/20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white lg:bg-transparent">
        <div className="w-full max-w-md lg:bg-white lg:p-12 lg:rounded-3xl lg:shadow-[0_20px_50px_rgba(8,112,184,0.1)] transition-all">
          <div className="mb-10 text-center lg:text-left">
            <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 mx-auto lg:mx-0">
               <span className="text-white text-2xl font-bold font-serif italic">L</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Selamat Datang</h1>
            <p className="text-gray-500 mt-2 font-medium">Silakan masuk ke akun Anda</p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-8 animate-shake">
              <p className="text-sm font-bold flex items-center">
                <span className="mr-2">⚠️</span> {errorMsg}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* USERNAME */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 tracking-wide uppercase px-1">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 font-medium"
                  placeholder="admin_laundry"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-gray-700 tracking-wide uppercase">
                  Password
                </label>
                {/* <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Lupa Password?
                </a> */}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl transition-all duration-300 transform active:scale-[0.98]
                ${loading 
                  ? "bg-blue-400 cursor-not-allowed shadow-none" 
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200"
                }
              `}
            >
              <div className="flex items-center justify-center">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Masuk Sekarang"
                )}
              </div>
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-gray-100">
             <div className="flex justify-between items-center text-gray-400">
                <p className="text-sm font-medium">© {new Date().getFullYear()} Laundry App</p>
                <div className="flex gap-4">
                  <span className="text-xs font-bold bg-gray-50 px-3 py-1 rounded-full text-gray-500 border border-gray-100">V.1.0</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}
