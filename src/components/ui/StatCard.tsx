import styles from "./StatCard.module.css";

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: "orange" | "cyan" | "violet" | "green" | "red";
  subtitle?: string;
}

export default function StatCard({ label, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.iconWrap}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </div>
    </div>
  );
}
