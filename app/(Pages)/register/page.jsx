"use client";
import React, { useState, useEffect } from "react";
import { Button, Card, Label, Spinner, TextInput } from "flowbite-react";
import Link from "next/link";
import { AvatarGenerator } from "random-avatar-generator";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/app/Firebase/Firebase";
import { doc, setDoc } from "firebase/firestore";
import { HiInformationCircle } from "react-icons/hi";
import { Alert } from "flowbite-react";
import Image from "next/image";

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const router = useRouter();

  const generateRandomAvatar = () => {
    const generator = new AvatarGenerator();
    return generator.generateRandomAvatar();
  };

  const handleAvatarRefresh = () => {
    setAvatarUrl(generateRandomAvatar());
  };

  useEffect(() => {
    setAvatarUrl(generateRandomAvatar());
  }, []);

  const validForm = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required!";
    } else {
      newErrors.name = "";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required!";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email address.";
    } else {
      newErrors.email = "";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required!";
    } else if (password.length < 6) {
      newErrors.password = "Password must be more than 6 characters.";
    } else {
      newErrors.password = "";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required!";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords must match!";
    } else {
      newErrors.confirmPassword = "";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).every((key) => !newErrors[key]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!validForm()) {
        setLoading(false);
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const docRef = doc(firestore, "users", user.uid);
      await setDoc(docRef, {
        name,
        email,
        avatarUrl,
      });
      setLoading(false);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      console.log("success");

      router.push("/login");
    } catch (error) {

      setLoading(false);
      let errorMessage = "An error occurred during registration.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email address is already in use.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "The password is too weak.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      }
      setErrorMessage(errorMessage);
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <Card className="w-full sm:w-1/3  mx-3">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="header">
            <header>
              <h1 className="font-bold text-center text-2xl">
                Create an account
              </h1>
            </header>
          </div>

          <div className="flex justify-between items-center  border border-gray-200 p-3 rounded">
            <Image
              src={avatarUrl}
              alt="avatar"
              className="w-20 h-20 rounded-full"
              width={20}
              height={20}
            />
            <Button onClick={handleAvatarRefresh} type="button">
              New Avatar
            </Button>
          </div>

          {errorMessage && (
            <Alert color="failure" icon={HiInformationCircle}>
              <span className="font-medium"></span> {errorMessage}
            </Alert>
          )}

          <div>
            <div className="mb-2 block">
              <Label htmlFor="name" value="Your name" />
            </div>
            <TextInput
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && (
              <small className="text-red-500 ms-3 mt-1 ">{errors.name}</small>
            )}
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="email1" value="Your email" />
            </div>
            <TextInput
              id="email1"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <small className="text-red-500 ms-3 mt-1 ">{errors.email}</small>
            )}
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="password1" value="Your password" />
            </div>
            <TextInput
              id="password1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <small className="text-red-500 ms-3 mt-1 ">
                {errors.password}
              </small>
            )}
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="password2" value="Confirm password" />
            </div>
            <TextInput
              id="password2"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && (
              <small className="text-red-500 ms-3 mt-1 ">
                {errors.confirmPassword}
              </small>
            )}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <Spinner aria-label="Default status example" />
            ) : (
              "Sign up"
            )}
          </Button>
        </form>

        <h4 className="text-center ">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600">
            signIn{" "}
          </Link>
        </h4>
      </Card>
    </div>
  );
}

export default RegisterForm;