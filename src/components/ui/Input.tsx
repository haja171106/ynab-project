import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  required?: boolean;
}

export default function Input({ label, error, icon, required, className = "", ...props }: InputProps) {
  return (
    <div className={styles.group}>
      {label && (
        <label className={styles.label}>
          {label}{required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrap}>
        {icon && <i className={`fa-solid ${icon} ${styles.icon}`} />}
        <input
          className={`${styles.input} ${icon ? styles.hasIcon : ""} ${error ? styles.inputError : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
