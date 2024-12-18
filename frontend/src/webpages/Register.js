import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

// Function to allow an applicant to register. Employees must be registered on the django-admin page, or they can register here and have their permissions set to is_staff = true at a later date
const Register = () => {
  const [register, setRegister] = useState({ username: "", password: "", email: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [passwordError, setPasswordError] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const isPasswordValid = validatePassword(register.password);
    setIsSubmitDisabled(register.password !== confirmPassword || !isPasswordValid || !captchaToken);
  }, [register.password, confirmPassword, captchaToken]);

  // This makes sure the password has at least 1 symbol, number and must be at least 8 characters long.
  const validatePassword = (password) => {
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const isValidLength = password.length >= 8;
    if (!hasNumber || !hasSymbol || !hasUppercase || !isValidLength) {
      setPasswordError("Password must be at least 8 characters long and contain at least 1 number, 1 symbol, and 1 uppercase letter.");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    if (name === "confirmpassword") {
      setConfirmPassword(value);
    } else {
      setRegister({
        ...register,
        [name]: value,
      });
    }
  };

  const fetchRegister = async () => {
    const usernamelength = register.username.length;
    const encryptedPassword = encryptpassword(register.password, usernamelength); // This password is shifted using a caesar shift that shifts based on the length of the username
    const response = await fetch("/applicant/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...register, password: encryptedPassword }),
    });

    if (response.ok) {
      navigate("/login/");
      window.location.reload();
    } else {
      const data = await response.json();
      if (data.error.includes("Username already exists")) {
        setUsernameError("Username already exists, please choose a different username.");
      }
      if (data.error.includes("Email already exists")) {
        setEmailError("Email already exists, please choose a different email.");
      }
    }
  };

  // Encrypts the user's password with a caesar shift based on the length of the username
  const encryptpassword = (text, shift) => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      return String.fromCharCode(code + shift);
    }).join('');
  };

  const submit = (e) => {
    e.preventDefault();
    const form = e.target;
    if (form.checkValidity() === false) {
      e.stopPropagation();
    } else {
      fetchRegister();
    }
    form.classList.add("was-validated");
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  return (
    <form className="container-sm w-25 needs-validation" onSubmit={submit} noValidate>
      <div className="mb-3">
        <label htmlFor="username" className="form-label">
          Username
        </label>
        <input
          onChange={handleInput}
          type="text"
          className="form-control"
          name="username"
          required
        />
        <div className="invalid-feedback">
          Please provide a valid username.
        </div>
        {usernameError && <div className="alert alert-danger">{usernameError}</div>}
        <div className="form-text">
          This can be your email address or a specific name you wish to use!
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          onChange={handleInput}
          type="email"
          className="form-control"
          name="email"
          required
        />
        <div className="invalid-feedback">
          Please provide a valid email address.
        </div>
        {emailError && <div className="alert alert-danger">{emailError}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          onChange={handleInput}
          type="password"
          className="form-control"
          name="password"
          required
        />
        <div className="invalid-feedback">
          {passwordError || "Please provide a valid password."}
        </div>
        <div className="form-text">
          Password must contain the following:
          <ul>
            <li>At least 8 characters</li>
            <li>At least 1 uppercase letter</li>
            <li>At least 1 number</li>
            <li>At least 1 symbol</li>
          </ul>
          We advise for you to use a password manager to automatically create
          you a secure password such as LastPass or iCloud Keychain.
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="confirmpassword" className="form-label">
          Confirm Password
        </label>
        <input
          onChange={handleInput}
          type="password"
          className="form-control"
          name="confirmpassword"
          required
        />
        <div className="invalid-feedback">
          Please confirm your password.
        </div>
      </div>
      <div className="mb-3">
        <ReCAPTCHA
          sitekey="6LfpyZYqAAAAAM-7ZypwZrDKblkTZWUCTQ6aPjJA"
          onChange={handleCaptchaChange}
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={isSubmitDisabled}>
        Register
      </button>
    </form>
  );
};

export default Register;