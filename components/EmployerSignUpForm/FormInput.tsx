import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

type Option = { value: string; label: string };
type Field = {
  name: string;
  type: string;
  icon: React.ElementType;
  options?: Option[];
  validation?: any;
  placeholder?: string;
  autoComplete?: string;
  showPasswordToggle?: boolean;
};

const FormInput = ({ field, errors }: { field: Field; errors: any }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useFormContext();

  return (
    <div className="space-y-1">
      <div className="relative">
            {field.options?.map((option: Option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          <select
            id={field.name}
            className={`block w-full pl-10 pr-3 py-2.5 border ${
              errors[field.name] ? 'border-red-300' : 'border-gray-200'
            } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
            {...register(field.name, field.validation)}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
     : (
          <input
            id={field.name}
            type={field.showPasswordToggle ? (showPassword ? 'text' : field.type) : field.type}
            className={`block w-full pl-10 pr-3 py-2.5 border ${
              errors[field.name] ? 'border-red-300' : 'border-gray-200'
            } rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-colors`}
            placeholder={field.placeholder || ' '}
            {...register(field.name, field.validation)}
            autoComplete={field.autoComplete}
          />
        )

        {field.showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
          >
            {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      {errors[field.name] && (
        <p className="text-xs text-red-500">
          {errors[field.name].message}
        </p>
      )}
    </div>
  );
};

export default FormInput;