import CountUp from "react-countup";
import { cn } from "@/lib/utils";

interface CounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  label?: string;
  className?: string;
}

export default function Counter({
  value,
  suffix = "",
  prefix = "",
  decimals,
  duration = 2.5,
  label,
  className = "",
}: CounterProps) {
  const autoDecimals =
    decimals ?? (Number.isInteger(value) ? 0 : value.toString().split(".")[1]?.length || 0);

  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <CountUp
        start={0}
        end={value}
        duration={duration}
        suffix={suffix}
        prefix={prefix}
        decimals={autoDecimals}
        enableScrollSpy
        scrollSpyOnce
      >
        {({ countUpRef }) => <span ref={countUpRef} />}
      </CountUp>
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
    </span>
  );
}
