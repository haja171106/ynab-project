import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  loading?: boolean;
  icon?: string;
}

export default function Button({
  variant = "primary", size = "md", full = false,
  loading = false, icon, children, className = "", ...props
}: ButtonProps) {
  return (
    <button
      className={`${styles.btn} ${styles[variant]} ${size !== "md" ? styles[size] : ""} ${full ? styles.full : ""} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <i className="fa-solid fa-spinner fa-spin" /> : icon && <i className={`fa-solid ${icon}`} />}
      {children}
    </button>
  );
}
