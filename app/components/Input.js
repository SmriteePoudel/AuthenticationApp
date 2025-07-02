"use client";

export default function Input({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = "",
}) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black ${className}`}
    />
  );
}
