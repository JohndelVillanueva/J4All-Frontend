import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
// import { useNavigate } from "react-router-dom";

type FormData = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  contactPerson: string;
  industry: string;
  companySize: string;
  websiteUrl: string;
  foundedYear: number | string;
  address: string;
  agreeToTerms: boolean;
  userType: "EMPLOYER";
};
// const navigate = useNavigate();

export default function EmployerSignupForm() {
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const passwordValue = watch("password");

  useEffect(() => {
    console.log("❗Form validation errors:", errors);
  }, [errors]);

  const onSubmit = async (data: FormData) => {
    console.log("🖱️ Button clicked");

    // Log validation data
    console.log("📤 Submitting with data:", data);

    try {
      const payload = {
        user: {
          email: data.email,
          username: data.username,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          userType: "EMPLOYER",
        },
        employer: {
          companyName: data.companyName,
          contactPerson: data.contactPerson,
          industry: data.industry,
          companySize: data.companySize,
          websiteUrl: data.websiteUrl,
          foundedYear: Number(data.foundedYear),
          address: data.address,
        },
        confirmPassword: data.confirmPassword,
        agreeToTerms: data.agreeToTerms,
      };

      console.log("📦 Payload being sent to server:", payload);

      const response = await axios.post("/api/createEmployer", payload);

      console.log("✅ Success response:", response.data);
      alert("✅ Form submitted successfully!");
      // navigate("/");
    } catch (error: any) {
      console.error("❌ Axios error:", error);

      const responseData = error?.response?.data;
      console.log("❌ Full error response:", responseData);

      const fieldErrors = responseData?.errors?.fieldErrors || {};
      for (const field in fieldErrors) {
        const messages = fieldErrors[field];
        if (Array.isArray(messages) && messages.length > 0) {
          setError(field as keyof FormData, {
            type: "server",
            message: messages[0],
          });
        }
      }

      const formErrors = responseData?.errors?.formErrors || [];
      if (formErrors.length > 0) {
        alert("Form errors:\n" + formErrors.join("\n"));
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-lg mx-auto"
    >
      <input
        type="text"
        {...register("email", { required: "Email is required" })}
        placeholder="Email"
      />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <input
        type="text"
        {...register("username", { required: "Username is required" })}
        placeholder="Username"
      />
      {errors.username && (
        <p className="text-red-500">{errors.username.message}</p>
      )}

      <input
        type="password"
        {...register("password", {
          required: "Password is required",
          pattern: {
            value: /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/,
            message:
              "Password must be at least 6 characters and include a number and special character",
          },
        })}
        placeholder="Password"
      />
      {errors.password && (
        <p className="text-red-500">{errors.password.message}</p>
      )}

      <input
        type="password"
        {...register("confirmPassword", {
          required: "Please confirm your password",
          validate: (val) => val === passwordValue || "Passwords do not match",
        })}
        placeholder="Confirm Password"
      />
      {errors.confirmPassword && (
        <p className="text-red-500">{errors.confirmPassword.message}</p>
      )}

      <input type="text" {...register("firstName")} placeholder="First Name" />
      <input type="text" {...register("lastName")} placeholder="Last Name" />
      <input type="text" {...register("phone")} placeholder="Phone Number" />

      <input
        type="text"
        {...register("companyName")}
        placeholder="Company Name"
      />
      <input
        type="text"
        {...register("contactPerson")}
        placeholder="Contact Person"
      />
      <input type="text" {...register("industry")} placeholder="Industry" />

      <select
        {...register("companySize", { required: "Company size is required" })}
      >
        <option value="">Select Company Size</option>
        <option value="1-10">1-10</option>
        <option value="11-50">11-50</option>
        <option value="51-200">51-200</option>
        <option value="201-500">201-500</option>
        <option value="501+">501+</option>
      </select>
      {errors.companySize && (
        <p className="text-red-500">{errors.companySize.message}</p>
      )}

      <input
        type="text"
        {...register("websiteUrl")}
        placeholder="Website URL"
      />
      <input
        type="number"
        {...register("foundedYear")}
        placeholder="Founded Year"
      />
      {errors.foundedYear && (
        <p className="text-red-500">{errors.foundedYear.message}</p>
      )}

      <input type="text" {...register("address")} placeholder="Address" />

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          {...register("agreeToTerms", {
            validate: (value) => value === true || "You must accept terms",
          })}
        />
        <span>I agree to the terms and conditions</span>
      </label>
      {errors.agreeToTerms && (
        <p className="text-red-500">{errors.agreeToTerms.message}</p>
      )}

      <button
        type="submit"
        onClick={() => console.log("🖱️ Button clicked")}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Sign Up
      </button>
    </form>
  );
}
