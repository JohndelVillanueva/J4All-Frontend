// import { FormFieldConfig } from "../types/types";
// import { 
//   FaUser, 
//   FaLock, 
//   FaUserTie, 
//   FaBuilding, 
//   FaGlobe, 
//   FaPhone, 
//   FaCalendarAlt, 
//   FaMapMarkerAlt,
//   FaBriefcase,
//   FaEye,
//   FaEyeSlash
// } from "react-icons/fa";

// export const accountFields: FormFieldConfig[] = [
//   {
//     name: "email",
//     label: "Email",
//     type: "email",
//     icon: FaUser,
//     validation: { 
//       required: "Email is required",
//       pattern: {
//         value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//         message: "Invalid email address"
//       }
//     },
//     autoComplete: "email",
//     placeholder: "your@email.com"
//   },
//   {
//     name: "username",
//     label: "Username",
//     type: "text",
//     icon: FaUser,
//     validation: {
//       required: "Username is required",
//       minLength: {
//         value: 3,
//         message: "Username must be at least 3 characters"
//       }
//     },
//     autoComplete: "username"
//   },
//   {
//     name: "password",
//     label: "Password",
//     type: "password",
//     icon: FaLock,
//     validation: {
//       required: "Password is required",
//       pattern: {
//         value: /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/,
//         message: "Password must be at least 6 characters with 1 number and 1 special character"
//       }
//     },
//     autoComplete: "new-password",
//     showPasswordToggle: true
//   },
//   {
//     name: "confirmPassword",
//     label: "Confirm Password",
//     type: "password",
//     icon: FaLock,
//     validation: {
//       required: "Please confirm your password",
//       validate: (value: any) => {
//         // @ts-ignore
//         const password = (document.querySelector('input[name="password"]') as HTMLInputElement)?.value;
//         return value === password || "Passwords do not match";
//       }
//     },
//     autoComplete: "new-password",
//     showPasswordToggle: true
//   }
// ];

// export const personalFields: FormFieldConfig[] = [
//   {
//     name: "firstName",
//     label: "First Name",
//     type: "text",
//     icon: FaUserTie,
//     autoComplete: "given-name"
//   },
//   {
//     name: "lastName",
//     label: "Last Name",
//     type: "text",
//     icon: FaUserTie,
//     autoComplete: "family-name"
//   },
//   {
//     name: "phone",
//     label: "Phone Number",
//     type: "tel",
//     icon: FaPhone,
//     autoComplete: "tel",
//     validation: {
//       pattern: {
//         value: /^\+?[\d\s\-()]+$/,
//         message: "Invalid phone number"
//       }
//     }
//   }
// ];

// export const companyFields: FormFieldConfig[] = [
//   {
//     name: "companyName",
//     label: "Company Name",
//     type: "text",
//     icon: FaBuilding,
//     autoComplete: "organization",
//     validation: {
//       required: "Company name is required"
//     }
//   },
//   {
//     name: "contactPerson",
//     label: "Contact Person",
//     type: "text",
//     icon: FaUserTie
//   },
//   {
//     name: "industry",
//     label: "Industry",
//     type: "text",
//     icon: FaBriefcase
//   },
//   {
//     name: "companySize",
//     label: "Company Size",
//     type: "select",
//     icon: FaUser,
//     options: [
//       { value: "", label: "Select Company Size" },
//       { value: "1-10", label: "1-10" },
//       { value: "11-50", label: "11-50" },
//       { value: "51-200", label: "51-200" },
//       { value: "201-500", label: "201-500" },
//       { value: "501+", label: "501+" }
//     ],
//     validation: {
//       required: "Company size is required"
//     }
//   },
//   {
//     name: "websiteUrl",
//     label: "Website URL",
//     type: "url",
//     icon: FaGlobe,
//     autoComplete: "url"
//   },
//   {
//     name: "foundedYear",
//     label: "Founded Year",
//     type: "number",
//     icon: FaCalendarAlt,
//     validation: {
//       min: {
//         value: 1800,
//         message: "Year must be after 1800"
//       },
//       max: {
//         value: new Date().getFullYear(),
//         message: "Year cannot be in the future"
//       }
//     }
//   },
//   {
//     name: "address",
//     label: "Address",
//     type: "text",
//     icon: FaMapMarkerAlt,
//     autoComplete: "street-address"
//   }
// ];