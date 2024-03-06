"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Label, Spinner, TextInput } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/Firebase/Firebase";
import { HiInformationCircle } from "react-icons/hi";
import { Alert } from "flowbite-react";


function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();


  const validForm = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const newErrors = {};

 

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


    setErrors(newErrors);
    return Object.keys(newErrors).every((key) => !newErrors[key]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try{

      if (!validForm()) {
        setLoading(false);
        return;
      }
      const userCredential = await signInWithEmailAndPassword(auth,email,password);
      const user = userCredential.user;

      if(user){

        setEmail("");
        setPassword("");
        setLoading(false);
        router.push('/');
      }}catch(error){
      console.log(error);
      setLoading(false);
      let errorMessage = "An error occurred during login.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No user found with this email address.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      }
      setErrorMessage(errorMessage);
    }

  };

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <Card className="w-full sm:w-1/3 mx-3">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="header">
            <header>
              <h1 className="font-bold text-center text-2xl">
               Sign In
              </h1>
            </header>
          </div>
          {errorMessage && (
            <Alert color="failure" icon={HiInformationCircle}>
              <span className="font-medium"></span> {errorMessage}
            </Alert>
          )}



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



          <Button type="submit" disabled={loading}>
            {loading ? (
              <Spinner aria-label="Default status example" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <h4 className="text-center ">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600">
            sign up{" "}
          </Link>
        </h4>

   
      </Card>
    </div>
  );
}

export default Login;