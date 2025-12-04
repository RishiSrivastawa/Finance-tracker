import React, { useState, useContext } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import uploadImage from "../../utils/uploadImage";

const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");              // ⬅️ new
  const [error, setError] = useState(null);
  const [info, setInfo] = useState("");            // ⬅️ for success/info messages
  const [step, setStep] = useState("FORM");        // "FORM" | "VERIFY"
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // STEP 1: Handle Sign Up Form Submit
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (step === "VERIFY") return; // safety, real verify handled by handleVerifyOtp

    let profileImageUrl = "";

    // basic validations
    if (!fullName) {
      setError("Please enter your name");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter the password");
      return;
    }

    setError("");
    setInfo("");
    setLoading(true);

    try {
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        fullName,
        email,
        password,
        profileImageUrl,
      });

      // backend now sends: { success, message, devOtp? }
      setStep("VERIFY");
      setInfo(
        "We have sent an OTP to your email. Please enter it below to verify your account."
      );

      // for dev you can log devOtp if you included it in backend
      if (response.data.devOtp) {
        console.log("Dev OTP (for testing):", response.data.devOtp);
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle OTP verification on same page
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.VERIFY_EMAIL, {
        email, // same email used for signup
        otp,
      });

      const { token, user, message } = res.data;

      setInfo(message || "Email verified successfully.");

      if (token && user) {
        // auto-login after verification
        localStorage.setItem("token", token);
        updateUser(user);
        navigate("/dashboard");
      } else {
        // fallback: go to login if no token returned
        navigate("/login");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong while verifying OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Create an Account</h3>
        <p className=" text-xs text-slate-700 mt-[5px] mb-6">
          {step === "FORM"
            ? "Join us today by entering your details below."
            : "Enter the OTP we sent to your email to verify your account."}
        </p>

        {/* use different submit handler based on step */}
        <form onSubmit={step === "FORM" ? handleSignUp : handleVerifyOtp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="Rishi"
              type="text"
              disabled={step === "VERIFY"} // lock fields after signup
            />
            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@example.com"
              type="text"
              disabled={step === "VERIFY"}
            />
            <div className="col-span-2">
              <Input
                value={password}
                onChange={({ target }) => setPassword(target.value)}
                label="Password"
                placeholder="Min 8 Characters"
                type="password"
                disabled={step === "VERIFY"}
              />
            </div>
          </div>

          {/* OTP input only in VERIFY step */}
          {step === "VERIFY" && (
            <div className="mt-4">
              <Input
                value={otp}
                onChange={({ target }) => setOtp(target.value)}
                label="OTP"
                placeholder="Enter 6-digit code"
                type="text"
              />
              <p className="text-xs text-slate-700 mt-1">
                OTP has been sent to <span className="font-medium">{email}</span>.
              </p>
            </div>
          )}

          {error && <p className="text-red-500 text-xs pb-2.5 mt-2">{error}</p>}
          {info && <p className="text-green-600 text-xs pb-2.5 mt-1">{info}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? "Please wait..."
              : step === "FORM"
              ? "SIGN UP"
              : "VERIFY OTP"}
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Already have an account?{" "}
            <Link className="font-medium text-primary underline" to="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
