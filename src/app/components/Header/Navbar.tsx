"use client";
import React, {
  useEffect,
  useState,
  useContext,
  ChangeEvent,
  FormEvent,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, DialogPanel, PopoverGroup } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "../../content/ThemeContext";
import { AuthContext } from "../../content/AuthContext";

interface LoginFormProps {
  isDarkMode: boolean;
  onClose: () => void;
  openSignUp: () => void;
}
const LoginForm: React.FC<LoginFormProps> = ({
  isDarkMode,
  onClose,
  openSignUp,
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login, error, setError } = useContext(AuthContext);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setFormError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`max-w-md w-full mx-auto p-4 sm:p-6 ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-lg`}
    >
      <h2
        className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Login
      </h2>
      {(error || formError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error || formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className={`block mb-1 text-sm font-medium ${
              isDarkMode ? "text-white" : "text-gray-700"
            }`}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className={`block mb-1 text-sm font-medium ${
              isDarkMode ? "text-white" : "text-gray-700"
            }`}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div
        className={`mt-4 text-sm text-center ${
          isDarkMode ? "text-gray-300" : "text-gray-600"
        }`}
      >
        Don&apos;t have an account?{" "}
        <button
          type="button"
          className="text-blue-500 hover:text-blue-600 font-medium"
          onClick={() => {
            setError("");
            onClose();
            openSignUp();
          }}
        >
          Sign up here
        </button>
      </div>
    </div>
  );
};

interface SignUpFormProps {
  isDarkMode: boolean;
  onClose: () => void;
  openLogin: () => void;
}
const SignUpForm: React.FC<SignUpFormProps> = ({ isDarkMode, onClose, openLogin }) => {
  const { register, error, setError } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError("File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setFormError("Only image files are allowed");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setFormError("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError("");

    if (!formData.username || !formData.email || !formData.password) {
      setFormError("Please fill all required fields");
      setIsLoading(false);
      return;
    }

    if (
      formData.phoneNumber &&
      !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber)
    ) {
      setFormError("Invalid phone number format");
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      if (photoFile) {
        formDataToSend.append("photo", photoFile);
      }
      await register(formDataToSend);
      onClose();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`max-w-md w-full mx-auto p-4 sm:p-6 ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-lg`}
    >
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2
          className={`text-xl sm:text-2xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Sign Up
        </h2>
        <button
          onClick={onClose}
          className={`p-1 rounded-full ${
            isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
        >
          <XMarkIcon
            className={`h-6 w-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          />
        </button>
      </div>

      {(error || formError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error || formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-gray-300">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Photo
                  </span>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </label>
          </div>
          <p
            className={`text-xs ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Optional: Upload a profile photo (max 5MB)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="username"
              className={`block mb-1 text-sm font-medium ${
                isDarkMode ? "text-white" : "text-gray-700"
              }`}
            >
              Username*
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              placeholder="Choose a username"
              required
            />
          </div>
          <div>
            <label
              htmlFor="phoneNumber"
              className={`block mb-1 text-sm font-medium ${
                isDarkMode ? "text-white" : "text-gray-700"
              }`}
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              placeholder="+1234567890"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="email"
              className={`block mb-1 text-sm font-medium ${
                isDarkMode ? "text-white" : "text-gray-700"
              }`}
            >
              Email*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="password"
              className={`block mb-1 text-sm font-medium ${
                isDarkMode ? "text-white" : "text-gray-700"
              }`}
            >
              Password*
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating Account...
            </>
          ) : (
            "Sign Up"
          )}
        </button>
        <div
          className={`mt-4 text-sm text-center ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Already have an account?{" "}
          <button
            type="button"
            className="text-blue-500 hover:text-blue-600 font-medium"
            onClick={() => {
              setError("");
              onClose();
              openLogin();
            }}
          >
            Log in
          </button>
        </div>
      </form>
    </div>
  );
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignUpModalOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const pathname = usePathname();

  const isHomePage = pathname === "/";
  const isPage = [
    "/about",
    "/properties",
    "/events",
    "/achievements",
    "/careers",
    "/journey",
    "/contact",
    "/dashboard",
  ].includes(pathname);

  const isDarkTextPage = [
    "/about",
    "/achievements",
    "/careers",
    "/journey",
    "/profile",
    "/dashboard",
  ].includes(pathname);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 0);

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const getTextColorClass = (isActive: boolean) => {
    if (isActive) {
      return "text-blue-500 after:absolute after:-bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-500";
    }
    if (isDarkTextPage) {
      return isDarkMode
        ? "text-white hover:text-gray-300"
        : "text-gray-900 hover:text-gray-700";
    }
    if (isHomePage) {
      return isDarkMode
        ? "text-white hover:text-gray-300"
        : "text-gray-900 hover:text-gray-700";
    }
    if (isPage) {
      return isDarkTextPage
        ? "text-gray-900 hover:text-gray-700"
        : "text-white hover:text-gray-300";
    }
    return isDarkMode
      ? "text-white hover:text-gray-300"
      : "text-gray-900 hover:text-gray-700";
  };

  const getIconColorClass = () => {
    if (isDarkTextPage) {
      return isDarkMode
        ? "text-white hover:text-gray-300"
        : "text-gray-900 hover:text-gray-700";
    }
    if (isHomePage) {
      return isDarkMode
        ? "text-white"
        : isScrolled
        ? "text-gray-900"
        : "text-gray-900";
    }
    if (isPage) {
      return isDarkTextPage ? "text-gray-900" : "text-white";
    }
    return isDarkMode ? "text-white" : "text-gray-700";
  };

  return (
    <header
      className={`fixed w-full z-[2] transition-all duration-300 ease-in-out ${
        showNavbar ? "top-0" : "-top-24"
      } ${isScrolled ? "backdrop-blur-md shadow-md" : "bg-transparent"}`}
    >
      <div className={`${isDarkMode ? "" : "bg-transparent"}`}>
        <nav className="mx-auto outline-none flex max-w-7xl items-center justify-between py-3 lg:px-8 px-2">
          <PopoverGroup className="hidden lg:flex items-center lg:gap-x-12">
            {["About", "Properties"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className={`relative text-sm font-semibold transition-colors ${getTextColorClass(
                  pathname === `/${item.toLowerCase()}`
                )}`}
              >
                {item}
              </Link>
            ))}
          </PopoverGroup>

          <Link href="/" className="lg:-m-1.5 lg:p-0 px-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                isDarkMode
                  ? "/images/Inrext logo with white tagline.png"
                  : "/images/Inrext logo.png"
              }
              alt="Inrext Logo"
              className="h-[50px] w-[157px]"
            />
          </Link>

          <div className="flex items-center lg:gap-x-12">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <Link href="/profile">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        user.photoURL.startsWith("http")
                          ? user.photoURL
                          : `http://localhost:5000${user.photoURL}`
                      }
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=random`;
                      }}
                    />
                  </Link>
                ) : (
                  <Link href="/profile">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-medium">
                        {user.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </Link>
                )}
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className={`relative hidden lg:flex text-sm font-semibold cursor-pointer transition-colors ${getTextColorClass(
                  false
                )}`}
              >
                Login
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:-m-2.5 p-0"
              aria-label="Open menu"
            >
              <Bars3Icon
                className={`lg:size-6 size-8 cursor-pointer ${getIconColorClass()}`}
              />
            </button>

            <button
              onClick={toggleTheme}
              className="hidden lg:flex p-1 cursor-pointer rounded-full border-2 border-blue-500 outline-none items-center"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <MoonIcon className="lg:size-5 text-white" />
              ) : (
                <SunIcon className={`lg:size-5 ${getIconColorClass()}`} />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Login Modal */}
      <Dialog open={loginModalOpen} onClose={() => setLoginModalOpen(false)}>
        <div className="fixed inset-0 bg-black/30 z-[3]" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[4]">
          <DialogPanel
            className={`max-w-sm w-full rounded-2xl ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } p-2`}
          >
            <LoginForm
              isDarkMode={isDarkMode}
              onClose={() => setLoginModalOpen(false)}
              openSignUp={() => {
                setLoginModalOpen(false);
                setSignUpModalOpen(true);
              }}
            />
          </DialogPanel>
        </div>
      </Dialog>

      {/* SignUp Modal */}
      <Dialog open={signupModalOpen} onClose={() => setSignUpModalOpen(false)}>
        <div className="fixed inset-0 bg-black/30 z-[3]" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[4]">
          <DialogPanel
            className={`max-w-sm w-full rounded-2xl ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } p-2`}
          >
            <SignUpForm
              isDarkMode={isDarkMode}
              onClose={() => setSignUpModalOpen(false)}
              openLogin={() => {
                setSignUpModalOpen(false);
                setLoginModalOpen(true);
              }}
            />
          </DialogPanel>
        </div>
      </Dialog>

      {/* Mobile Menu */}
      <Dialog open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <DialogPanel
          className={`fixed inset-y-0 z-[2] right-0 w-full lg:max-w-[20rem] md:max-w-md px-6 py-6 ${
            isDarkMode ? "bg-gray-900" : "bg-blue-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  isDarkMode
                    ? "/images/Inrext logo with white tagline.png"
                    : "/images/Inrext logo.png"
                }
                alt="Inrext Logo"
                className="h-8"
              />
            </Link>
            <div className="flex gap-5">
              <button
                onClick={toggleTheme}
                className="lg:flex p-1 cursor-pointer rounded-full border-2 border-blue-500 outline-none items-center"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <MoonIcon className="size-5 text-white" />
                ) : (
                  <SunIcon className="size-5 text-gray-900" />
                )}
              </button>
              <button onClick={() => setMobileMenuOpen(false)}>
                <XMarkIcon
                  className={`size-6 ${
                    isDarkMode ? "text-white cursor-pointer" : "text-gray-700"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6">
            {[
              "Home",
              "About",
              "Properties",
              "Events",
              "Achievements",
              "Careers",
              "Journey",
              "Contact",
              ...(isAuthenticated &&
              [
                "super_admin",
                "accounts",
                "team_head",
                "cab_management",
              ].includes(user?.role)
                ? ["Dashboard"]
                : []),
            ].map((item) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className={`block py-2 px-5 rounded-full text-base font-semibold ${
                  isDarkMode
                    ? "text-white hover:bg-gray-800"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className={`block w-full text-left py-2 px-5 rounded-full text-base font-semibold ${
                    isDarkMode
                      ? "text-white hover:bg-gray-800"
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSignUpModalOpen(true);
                  }}
                  className={`block w-full text-left py-2 px-5 rounded-full text-base font-semibold ${
                    isDarkMode
                      ? "text-white hover:bg-gray-800"
                      : "text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}