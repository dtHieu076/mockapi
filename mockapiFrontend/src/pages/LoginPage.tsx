import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useGlobalContext } from '../context/GlobalContext';
import { authApi } from '../api/authApi';

export const LoginPage: React.FC = () => {
  const { login, setError } = useGlobalContext();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { username?: string; password?: string } = {};

    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        const user = await authApi.register({ username, password });
        login(user);
      } else {
        const user = await authApi.login({ username, password });
        login(user);
      }
    } catch (err: any) {
      // Hiển thị thông báo lỗi đăng nhập không thành công
      setError(err.message || 'Đăng nhập không thành công');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[420px] bg-white rounded-[20px] shadow-xl shadow-slate-200/60 p-10 flex flex-col"
      >
        {/* Logo Placeholder */}
        <div className="flex justify-center mb-8">
          <div className="size-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <span className="material-symbols-outlined text-white text-2xl">api</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {isRegister ? 'Create an account' : 'Sign in to MockAPI'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isRegister ? 'Join us to start mocking APIs' : 'Access your mock environments and APIs'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
            <div className="relative">
              <input
                type="text"
                placeholder="your-username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username) setErrors({ ...errors, username: undefined });
                }}
                className={`w-full h-11 px-4 rounded-lg border transition-all outline-none text-sm ${errors.username
                    ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
              />
              {errors.username && (
                <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-medium">{errors.username}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              {!isRegister && (
                <button type="button" className="text-xs text-indigo-600 hover:underline font-medium">Forgot password?</button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                className={`w-full h-11 px-4 pr-10 rounded-lg border transition-all outline-none text-sm ${errors.password
                    ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
              {errors.password && (
                <p className="text-[11px] text-red-500 mt-1.5 ml-1 font-medium">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Remember Me */}
          {!isRegister && (
            <div className="flex items-center gap-2 ml-1">
              <input
                type="checkbox"
                id="remember"
                className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">
                Remember me
              </label>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center"
          >
            {isLoading ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              isRegister ? 'Sign Up' : 'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-indigo-600 font-semibold hover:underline transition-all"
            >
              {isRegister ? 'Sign In' : 'Create one'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
