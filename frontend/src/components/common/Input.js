import { useState } from "react";
import styles from "./Input.module.css";

function Input({ label, type = "text", name, value, onChange, error, placeholder, icon }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label} htmlFor={name}>{label}</label>}
      <div className={`${styles.inputBox} ${error ? styles.inputError : ""}`}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={styles.input}
        />
        {isPassword && (
          <span
            className={styles.toggle}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        )}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

export default Input;